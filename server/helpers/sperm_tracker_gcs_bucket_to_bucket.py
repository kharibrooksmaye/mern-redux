# import the necessary packages
# from videoprops import get_video_properties

from sort import *
import argparse
import time
import cv2
import glob
from matplotlib.transforms import Bbox
from datetime import date
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
from tqdm import tqdm
import scipy.spatial as sp
import operator
import os
from datetime import date
import matplotlib.patches as patches
# for accessing bucket
from google.cloud import storage
from google.api_core import page_iterator
# keras libraries
import keras
from keras_retinanet import models
from keras_retinanet.utils.image import read_image_bgr, preprocess_image, resize_image
# from utils import
# from utils import get_summary_image
import warnings
warnings.filterwarnings("ignore")




# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-gcs_input_path", "--gcs_input_path", required=True,
                help="path to input folder GCS, eg: gs://zephyrinput/5e39a20e6b9aaa62c077ad50",default="gs://zephyrinput/5e39a20e6b9aaa62c077ad50" )
ap.add_argument("-output_dir", "--output_dir", required=True,
                help="path to output dir")
ap.add_argument("-gcs_output_path", "--gcs_output_path", required=True,
                help="path to output dir")
ap.add_argument("-m", "--retinanet_model", required=True,
                help="base path to retinanet model")
ap.add_argument("-c", "--confidence", type=float, default=0.4,
                help="minimum probability to filter weak detections")
ap.add_argument("-pixcel_thresh", "--pixcel_thresh", type=float, default=35,
                help="minimum pixel moved to consider a good sample")
ap.add_argument("-frame_thresh", "--frame_thresh", type=int, default=15,
                help = "frames to cover for one track of an id")
ap.add_argument("-sensitivity", "--sensitivity", type=int, default=10,
                help = "cut of distance to distinguish betw immotile and non-progressive")

ap.add_argument("-credentials", "--credentials", type=str, default=" credentials/ZephyrD-106953f2ddf5.json",
                help = "credentials json file")
ap.add_argument("-p_font_size", "--p_font_size", type=float, default=0.9, help = "font size of id number of progressive sperms")
ap.add_argument("-p_box_color", "--p_box_color", nargs='+', type=int,  help = "color of boxes of progressive sperms")
ap.add_argument("-volume", "--volume", type=float, help= "sample volume")
ap.add_argument("-fields", "--fields", type=int, help= "number of specimens being processed and analyzed")
ap.add_argument("-record_name", "--record_name", type=str, help= "name of record being processed")


args = vars(ap.parse_args())

# api key in json format for authentication
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = args['credentials']

# # bucket usage
storage_client = storage.Client(" ZephyrD")
bucket_input = storage_client.get_bucket("zephyrinput")
bucket_output = storage_client.get_bucket("zephyroutput")
p_box_color = tuple(args['p_box_color'])

# initialize a list of colors to represent each possible class label
np.random.seed(42)
COLORS = np.random.randint(0, 255, size=(200, 3),
                           dtype="uint8")
tracks = []

gcs_path = args['gcs_input_path']
output_dir = args['output_dir']
frame_thresh = args['frame_thresh']
# derive the paths to the retinanet weights and model configuration
weightsPath = args["retinanet_model"]
print("[INFO] loading retinanet model from disk...")
net = models.load_model(weightsPath, backbone_name='resnet50')
green_threshold = 2
def load_image( image_path):
    """ Load an image at the image_index.
    """
    return read_image_bgr(image_path)

label_map = {1:"G", 0:"B", 2:"BC"}
# label_map = {1:"G", 0:"B", 2:"BC"}

# creating temp directory for saving intermediate results
try:
    os.makedirs(output_dir)
except:
    pass
try:
    os.makedirs(os.path.join(output_dir, "temp_save_img"))
except:
    pass
try:
    os.makedirs(os.path.join(output_dir, "temp_input"))
except:
    pass
temp_folder = os.path.join(output_dir, "temp_save_img")
temp_input = os.path.join(output_dir, "temp_input")



def get_summary_image(p_c,np_c,im_c,p_p,np_p,im_p,vid_c, morph, true_pro):

    height = 1800
    width = 1000
    font = cv2.FONT_HERSHEY_COMPLEX
    thickness = 2
    fontScale = 1
    font_scale_2 = 0.65

    total_sv = args['volume']
    fields = args['fields']
    total_conc = ((p_c+np_c+im_c)/vid_c) * 1.4464125

    if (total_conc == 0):
        summary_image = np.ones((height,width,3), np.uint8)*255

        summary_image = cv2.putText(summary_image, "Summary Report for " + str(args['record_name']), (150,60),  font,
                                                    fontScale, (0,0,0), 2, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, str(date.today()), (350,90),  font,
                                                    font_scale_2, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (50, 130), (900,1200), (0,0,0),3)
        summary_image = cv2.putText(summary_image, "No Specimen Found", (60, 170), font,
                                    0.6, (0, 0, 0), 1, cv2.LINE_AA) 
    else:
        total_conc = ((p_c+np_c+im_c)/vid_c) * 1.4464125
        total_concentration = ((p_c+np_c+im_c)/vid_c)* 1.4464125
        total_count = total_conc * total_sv
        total_count_summary = round(total_concentration * vid_c / 1.4464125, 2)
        vm_p = len(morph) / total_count_summary
        vp_p = len(true_pro) / total_count_summary
        no_morph_prog_count = (total_count_summary - im_c / total_count_summary) * total_count

        total_conc = '{0:.2e}'.format(total_conc)
        summary_image = np.ones((height,width,3), np.uint8)*255

        summary_image = cv2.putText(summary_image, "Summary Report for " + str(args['record_name']), (150,60),  font,
                                                        fontScale, (0,0,0), 2, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, str(date.today()), (350,90),  font,
                                                        font_scale_2, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Total Count (M)", (60, 170), font,
                                    0.6, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400, 140), (560, 200), (0, 0, 0), 2)

        summary_image = cv2.putText(summary_image, str(round(total_count, 2)), (430, 170), font,
                                    0.46, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Total Concentration (M/mL)", (60, 250), font,
                                    0.6, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400, 220), (560, 280), (0, 0, 0), 2)

        summary_image = cv2.putText(summary_image, str(total_conc), (430, 250), font,
                                    0.46, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Total Sample Volume (mL)", (60, 330), font,
                                    0.6, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400, 300), (560, 360), (0, 0, 0), 2)

        summary_image = cv2.putText(summary_image, str(total_sv), (430, 330), font,
                                    0.46, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Number of Fields", (60, 410), font,
                                    0.6, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400, 380), (560, 440), (0, 0, 0), 2)

        summary_image = cv2.putText(summary_image, str(fields), (430, 410), font,
                                    0.46, (0, 0, 0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (50, 130), (900,1200), (0,0,0),3)

        summary_image = cv2.rectangle(summary_image, (400,460), (750,520),  (120,120,120), -1)  
        summary_image = cv2.putText(summary_image, "Visible", (415,490),  font,
                                                        0.46, (255,255,255), 1, cv2.LINE_AA)
        summary_image = cv2.putText(summary_image, "% of Total", (525,490),  font,
                                                        0.46, (255,255,255), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Count (M)", (635,490),  font,
                                                        0.46, (255,255,255), 1, cv2.LINE_AA)

        #Totals label, visible, percentage, and count
        summary_image = cv2.putText(summary_image, "Total Count Summary", (60,570),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400,540), (480,600),  (0,0,0), 2)

        

        summary_image = cv2.putText(summary_image, str(total_count_summary), (430,570),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)
        summary_image = cv2.rectangle(summary_image, (520,540), (600,600),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, "100%", (550,570),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (630,540), (710,600),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(round(total_count, 2)), (645,570),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        #normal label, visible, percentage, and count
        summary_image = cv2.putText(summary_image, "Normal", (60,650),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400,620), (480,680),  (0,0,0), 2)

        summary_image = cv2.putText(summary_image, str(p_c), (430,650),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)
        summary_image = cv2.rectangle(summary_image, (520,620), (600,680),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(p_p) + "%", (540,650),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (630,620), (710,680),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(round(total_count * p_p / 100, 2)), (645,650),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        #immotile label, visible, percentage, and count
        summary_image = cv2.putText(summary_image, "Immotile", (60,730),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400,700), (480,760),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(im_c), (430,730),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (520,700), (600,760),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(im_p)+"%", (540,730),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (630,700), (710,760),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(round(total_count * im_p / 100, 2)), (645,730),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        #progressive label, visible, percentage, and count
        summary_image = cv2.putText(summary_image, "Progressive (1)", (60,810),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        if (len(morph) == 0 ):
            summary_image = cv2.rectangle(summary_image, (400,780), (480,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(total_count_summary - im_c), (430,810),  font, 0.46, (0,0,0), 1, cv2.LINE_AA)

            summary_image = cv2.rectangle(summary_image, (520,780), (600,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(round(total_count_summary - im_c / total_count_summary, 2))+"%", (540,810),  font,
                                                            0.46, (0,0,0), 1, cv2.LINE_AA)

            summary_image = cv2.rectangle(summary_image, (630,780), (710,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(round(no_morph_prog_count, 2)), (645,810),  font,
                                                            0.46, (0,0,0), 1, cv2.LINE_AA)
        else: 
            summary_image = cv2.rectangle(summary_image, (400,780), (480,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(len(true_pro)), (430,810),  font, 0.46, (0,0,0), 1, cv2.LINE_AA)

            summary_image = cv2.rectangle(summary_image, (520,780), (600,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(round(vp_p * 100, 2))+"%", (540,810),  font,
                                                            0.46, (0,0,0), 1, cv2.LINE_AA)

            summary_image = cv2.rectangle(summary_image, (630,780), (710,840),  (0,0,0), 2)
            summary_image = cv2.putText(summary_image, str(round(total_count_summary * vp_p, 2)), (645,810),  font,
                                                            0.46, (0,0,0), 1, cv2.LINE_AA)

        #morphology label, visible, percentage, and count
        summary_image = cv2.putText(summary_image, "Morphology (2)", (60,890),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (400,860), (480,920),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(len(morph)), (430,890),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (520,860), (600,920),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(round(vm_p * 100, 2))+"%", (540,890),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.rectangle(summary_image, (630,860), (710,920),  (0,0,0), 2)
        summary_image = cv2.putText(summary_image, str(round(total_count_summary * vm_p, 2)), (645,890),  font,
                                                        0.46, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Notes: ", (60,940),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        if (len(morph) == 0):
            summary_image = cv2.putText(summary_image, "(1) Progressive are specimen that have movement", (60,970),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)
        else:
            summary_image = cv2.putText(summary_image, "(1) Progressive are specimen that have speed >25 micrometers/sec", (60,970),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "(2) Morphology are specimen complying with WHO 5th Standards", (60,1000),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        summary_image = cv2.putText(summary_image, "Comments", (200,1060),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

        if (total_count >= 15):
            count_comm = 'Total Count: MEETS WHO 5th Total Count Standards'
        else:
            count_comm = 'Total Count: FAILS WHO 5th Total Count Standards'
        
        summary_image = cv2.putText(summary_image, str(count_comm), (60,1110),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)


        if (p_p >= 1.28):
            norm_comm = 'CONFORMS TO BOTH Motility & Morphology WHO 5th Standards'
            summary_image = cv2.putText(summary_image, str(norm_comm), (60,1140),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)
        elif (vp_p >= .32 and vm_p < .04):
            prog_comm = 'Motility: MEETS WHO 5th Motility Standards'
            morp_comm = 'Morphology: FAILS WHO 5th Morphology Standards'
            summary_image = cv2.putText(summary_image, str(prog_comm), (60,1140),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)

            summary_image = cv2.putText(summary_image, str(morp_comm), (60,1170),  font,
                                                        0.6, (0,0,0), 1, cv2.LINE_AA)
        elif (vp_p < .32 and vm_p < .04):
            prog_comm = 'Motility: FAILS WHO 5th Motility Standards'
            morp_comm = 'Morphology: FAILS WHO 5th Morphology Standards'
            summary_image = cv2.putText(summary_image, str(prog_comm), (60,1140),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)
            summary_image = cv2.putText(summary_image, str(morp_comm), (60,1170),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)
        elif(len(morph) == 0): 
            morp_comm = 'Morphology: FAILS WHO 5th Morphology Standards'
            summary_image = cv2.putText(summary_image, str(morp_comm), (60,1140),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)
        else:
            prog_comm = 'Motility: FAILS WHO 5th Motility Standards'
            morp_comm = 'Morphology: MEETS WHO 5th Morphology Standards'
            summary_image = cv2.putText(summary_image, str(prog_comm), (60,1140),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)
            summary_image = cv2.putText(summary_image, str(morp_comm), (60,1170),  font,
                                                            0.6, (0,0,0), 1, cv2.LINE_AA)

    return summary_image

#1&HNbYCzL&6V6OkjP4)rFs$


# for connecting tracker and models input
def iou(bb_test,bb_gt):
    """
    Computes IUO between two bboxes in the form [x1,y1,x2,y2]
    """
    xx1 = np.maximum(bb_test[0], bb_gt[0])
    yy1 = np.maximum(bb_test[1], bb_gt[1])
    xx2 = np.minimum(bb_test[2], bb_gt[2])
    yy2 = np.minimum(bb_test[3], bb_gt[3])
    w = np.maximum(0., xx2 - xx1)
    h = np.maximum(0., yy2 - yy1)
    wh = w * h
    o = wh / ((bb_test[2]-bb_test[0])*(bb_test[3]-bb_test[1])
    + (bb_gt[2]-bb_gt[0])*(bb_gt[3]-bb_gt[1]) - wh)
    return(o)


def _item_to_value(iterator, item):
    return item

def list_directories(bucket_name, prefix):
    if not prefix.endswith('/'):
        prefix += '/'

    extra_params = {
        "projection": "noAcl",
        "prefix": prefix,
        "delimiter": '/'
    }
    gcs = storage.Client()
    path = "/b/" + bucket_name + "/o"
    iterator = page_iterator.HTTPIterator(
        client=gcs,
        api_request=gcs._connection.api_request,
        path=path,
        items_key='prefixes',
        item_to_value=_item_to_value,
        extra_params=extra_params,
    )
    return [x for x in iterator]

# fetch files from gcs
os.system("gsutil cp -r {} {}".format(gcs_path, temp_input))
#
# os.system("cp -r {} {}".format(gcs_path, temp_input) )

# loop through each video in folder
if not gcs_path.endswith("/"):
    gcs_path = gcs_path + "/"
gcs_folder_name = gcs_path.split("/")[-1]
sub_folders = os.listdir(os.path.join(temp_input, gcs_folder_name))

root_path = os.path.join(temp_input, gcs_folder_name)

# check if there is folder inside the given path or it contains video itself, accordingly set root path
if len(sub_folders)>0:

    if os.path.isfile(os.path.join(temp_input,gcs_folder_name,sub_folders[0])):
        print("yes")
        sub_folders = os.listdir(temp_input)
        root_path = os.path.join(temp_input)

#loop over sub-folders and process the video
for a_folder in tqdm(sub_folders):
        print("[INFO] processing folder {}...".format(a_folder))
    # try:
        path_a_folder = os.path.join(root_path, a_folder)

        # the final dataframes to be saved for this folder
        df_combine_labels_analysis = pd.DataFrame(
            columns=['video_name',  'total_P', 'total_NP', 'total_IM'])
        df_combine_locations = pd.DataFrame(
            columns=[ 'frame_num', 'id','xmin', 'ymin', 'xmax', 'ymax', 'label', 'video_name'])

        videos = glob.glob(os.path.join(path_a_folder, "*"))

        complete_morph = []
        complete_prog = []
        for video in videos:
            # try:
                video_name = video.split("/")[-1]
                print("[INFO] processing video {}...".format(video_name))
                video_name_without_ext = video_name.split(".")[0]
                print(video_name)
                ext = video_name.split(".")[1]
                if  ext not in ["mp4", "avi","wmv"]:
                    continue

                # initializing the tracker
                tracker = Sort(max_age=5, min_hits=3)

                memory = {}
                counter1 = 0

                # intermediate dataframes for videos
                df_model = pd.DataFrame(columns=["frame_num", "xmin", "ymin", "xmax", "ymax", "label_model"])
                df_tracker = pd.DataFrame(
                    columns=["frame_num", "xmin", "ymin", "xmax", "ymax", "label_tracker", "id", 'distance'])

                vs = cv2.VideoCapture(os.path.join(path_a_folder, video_name))
                writer = None
                (W, H) = (None, None)
                frameIndex = 0
                trackid_distance = {}

                # loop over frames from the video file stream
                while frameIndex<=frame_thresh:

                    # read the next frame from the file
                    (grabbed, frame) = vs.read()

                    # if the frame was not grabbed, then we have reached the end of the stream
                    if not grabbed:
                        break

                    # run the detection
                    image = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    cv2.imwrite(os.path.join(temp_folder, "test.jpg"), image)

                    raw_image = load_image(os.path.join(temp_folder, "test.jpg"))
                    image = preprocess_image(raw_image.copy())
                    image, scale = resize_image(image)

                    if keras.backend.image_data_format() == 'channels_first':
                        image = image.transpose((2, 0, 1))
                    # run network
                    boxes, scores, labels = net.predict_on_batch(np.expand_dims(image, axis=0))[:3]
                    # correct boxes for image scale
                    boxes /= scale
                    # select indices which have a score above the threshold
                    indices = np.where(scores[0, :] > args["confidence"])
                    # select those scores
                    image_scores = scores[0][indices]
                    image_boxes = boxes[0][indices]
                    image_labels = labels[0][indices]
                    output_boxes, output_scores, output_labels = image_boxes, image_scores, image_labels

                    # initialize our lists of detected bounding boxes, confidences, and class IDs, respectively
                    boxes = []
                    confidences = []
                    classIDs = []

                    for box, score, label in zip(output_boxes, output_scores, output_labels):

                        label = label_map[label]

                        b = box.astype(int)
                        width = b[2] - b[0]
                        height = b[3] - b[1]
                        boxes.append([b[0], b[1], int(width), int(height)])
                        confidences.append(float(score))
                        classIDs.append(label)
                        df_model.loc[len(df_model)] = [frameIndex, b[0], b[1],b[2] ,b[3], label]

                    idxs = list(range(0,len(boxes)))
                    dets = []
                    if len(idxs) > 0:
                        # loop over the indexes we are keeping
                        for i in idxs:
                            (x, y) = (boxes[i][0], boxes[i][1])
                            (w, h) = (boxes[i][2], boxes[i][3])
                            dets.append([x, y, x + w, y + h, confidences[i]])

                    np.set_printoptions(formatter={'float': lambda x: "{0:0.3f}".format(x)})
                    dets = np.asarray(dets)
                    
                    if len(dets) > 0:
                        tracks = tracker.update(dets)
                        boxes = []
                        indexIDs = []
                        c = []
                        cl_IDs =[]
                        previous = memory.copy()
                        memory = {}

                    for track in tracks:
                        boxes.append([track[0], track[1], track[2], track[3]])
                        indexIDs.append(int(track[4]))
                        memory[indexIDs[-1]] = boxes[-1]

                    # update the tracker_id distance which keeps the centroid for first and last frame for each id
                    if len(boxes) > 0:
                        i = int(0)
                        counter1 += len(boxes)
                        for box in boxes:
                            # extract the bounding box coordinates
                            (x, y) = (int(box[0]), int(box[1]))
                            (x1, y1) = (int(box[2]), int(box[3]))
                            if indexIDs[i] not in trackid_distance:
                                trackid_distance[indexIDs[i]] = []
                            bbox = Bbox.from_bounds(x, y, (x1 - x) * 0.95, (y1 - y) * 0.95)

                            centre_x = x + (x1 - x) / 2
                            centre_y = y + (y1 - y) / 2

                            label = ''
                            dist = 0
                            if indexIDs[i] in trackid_distance:
                                if frameIndex==0 or frameIndex==frame_thresh:

                                    trackid_distance[indexIDs[i]].append([centre_x, centre_y])

                                    if frameIndex == frame_thresh:
                                        if len(trackid_distance[indexIDs[i]])>1:
                                            dist = sp.distance.euclidean(trackid_distance[indexIDs[i]][1],trackid_distance[indexIDs[i]][0])
                                            if dist > args['pixcel_thresh']:
                                                label = 'G'
                                            else:
                                                label = 'B'
                            df_tracker.loc[len(df_tracker)] = [frameIndex, x, y, x1, y1, label, indexIDs[i], dist]
                            i += 1

                    frameIndex = frameIndex + 1

                # integrating the tracker result into model's result by iou matching
                df_model['tracker_label'] = ''
                df_model['id'] = ''
                df_model['iou'] =''
                df_model['distance'] = 0

                for index,rows in df_model.iterrows():

                    frame = rows['frame_num']
                    x,y,x1,y1 = rows['xmin'], rows['ymin'], rows['xmax'], rows['ymax']
                    rows_tracker = df_tracker[df_tracker['frame_num']==frame]
                    iou_match = 0

                    for ind,r in rows_tracker.iterrows():
                        iou_m = iou(np.array([x,y,x1,y1]), np.array([r['xmin'],r['ymin'],r['xmax'],r['ymax']]))
                        if iou_m>iou_match:
                            select_id = r['id']
                            select_label = r['label_tracker']
                            iou_match = iou_m
                            dist = r['distance']

                    if iou_match>  0.1:
                        df_model.at[index, 'tracker_label'] = select_label
                        df_model.at[index,'id'] = select_id
                        df_model.at[index, 'iou'] = iou_match
                        df_model.at[index, 'distance'] = dist

                df_model['tracker_label'] = df_model['tracker_label'].astype(str)
                # final_label is created using info of model's label for 15 frames and tracker's label on 15th frame.
                df_model['final_label'] = ''

                frames = sorted(df_model.frame_num.unique().tolist())

                id_label_counter = {}
                tracker_fr = 0

                for id in df_model[df_model['frame_num'] == frame_thresh]['id'].values.tolist():
                    id_label_counter[id] = {}
                    for label in ['BC', 'G', 'B']:
                        print(id_label_counter)
                        id_label_counter[id].update({label: 0})

                prog = []
                for fr in frames:
                    rows_frame = df_model[df_model['frame_num'] == fr]
                    for i, row in rows_frame.iterrows():

                            x = row['xmin']
                            y = row['ymin']
                            x1 = row['xmax']
                            y1 = row['ymax']
                            id = row['id']
                            distance = row['distance']
                            if id!='':
                                if id in id_label_counter:
                                    id_label_counter[id][row['label_model']]+= 1

                                if tracker_fr == frame_thresh:

                                    selected_label = max(id_label_counter[id].items(), key=operator.itemgetter(1))[0]
                                    selected_label_count = id_label_counter[id][selected_label]

                                    centre_x = x + (x1 - x) / 2
                                    centre_y = y + (y1 - y) / 2

                                    print(row)
                                    if row['distance'] > args['pixcel_thresh']:
                                        prog.append(row)
                                    if row['tracker_label']=='G':
                                        complete_morph.append(row)
                                    if (id_label_counter[id]['G'] > green_threshold):
                                        complete_prog.append(row)
                                    print(id_label_counter[id])
                                    if row['tracker_label']=='G' and id_label_counter[id]['G']> green_threshold:
                                        df_model.at[i, 'final_label'] = 'progressive'
                                    else:
                                        df_model.at[i, 'final_label'] = 'non_progressive'
                                        if distance<args['sensitivity']:
                                            df_model.at[i, 'final_label'] = 'immotile'

                    tracker_fr += 1

                
                # fill all the row's label same as 15th frame label
                df_model['label'] = ''
                df_model['repeated_distance'] = 0

                frame_track_present = df_model[df_model['tracker_label']!='']['frame_num'].unique()
                print(frame_track_present, "# of frame_track_present")
                for fr in frame_track_present:
                    selected_frame_rows  = df_model[df_model['frame_num']==fr]
                    start_fr = fr-frame_thresh
                    for index,rows in selected_frame_rows.iterrows():
                        id = rows['id']
                        label = rows['final_label']
                        dist = rows['distance']
                        selected_frame_ids = df_model[(df_model['frame_num']>=start_fr) & (df_model['frame_num']<=fr) & (df_model['id']==id)]

                        for i, r in selected_frame_ids.iterrows():
                            df_model.at[i, 'label'] = label
                            df_model.at[i, 'repeated_distance'] = dist
                fr= frame_thresh
                selected_frame_rows  = df_model[df_model['frame_num']==fr]
                total_p = len(selected_frame_rows[selected_frame_rows['label']=='progressive'])
                total_np = len(selected_frame_rows[selected_frame_rows['label']=='non_progressive'])
                total_im = len(selected_frame_rows[selected_frame_rows['label']=='immotile'])

                data_loc = df_model[['frame_num','id','xmin','ymin','xmax','ymax','label']]

                data_loc = data_loc[data_loc['label']!='']
                data_loc['video_name'] = video_name

                df_combine_labels_analysis.loc[len(df_combine_labels_analysis)] = [video_name, total_p, total_np, total_im]
                df_combine_locations = pd.concat([df_combine_locations, data_loc], axis=0)

                frameIndex = 0
                vs = cv2.VideoCapture(os.path.join(path_a_folder, video_name))

                # create output video with displaying id, distance and type
                while frameIndex<=frame_thresh:

                    # read the next frame from the file
                    (grabbed, frame) = vs.read()

                    # if the frame was not grabbed, then we have reached the end # of the stream
                    if not grabbed:
                        break
                    rows_frame = df_model[df_model['frame_num'] == frameIndex]
                    for i, row in rows_frame.iterrows():

                        x = row['xmin']
                        y = row['ymin']
                        x1 = row['xmax']
                        y1 = row['ymax']
                        dist = row['repeated_distance']
                        id = row['id']

                        cv2.putText(frame, 'P', (10,30), cv2.FONT_HERSHEY_SIMPLEX, 1, p_box_color, 2)
                        cv2.putText(frame, 'NP', (60,30), cv2.FONT_HERSHEY_SIMPLEX, 1, [0,0,0], 2)
                        cv2.putText(frame, 'IM', (160,30), cv2.FONT_HERSHEY_SIMPLEX, 1, [255,0,0], 2)

                        if id!='' and row['label']!='':
                            color = [int(c) for c in COLORS[id % len(COLORS)]]
                            centre_x = x + (x1 - x) / 2
                            centre_y = y + (y1 - y) / 2
                            text = "{}".format(id)
                            cv2.putText(frame, text, (x, y - 5),
                                        cv2.FONT_HERSHEY_SIMPLEX,args['p_font_size'], color, 2)
                            text = "{}".format(str(int(dist)))

                            cv2.putText(frame, text, (x1-20, y1 - 10),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

                            if row['label'] == 'progressive':
                                color_rect = p_box_color
                                cv2.rectangle(frame, (x, y), (x1, y1), color_rect, 2)

                            elif row['label'] == 'non_progressive':
                                color_rect = [0, 0, 0]
                                cv2.rectangle(frame, (x, y), (x1, y1), color_rect, 2)

                            elif row['label'] == 'immotile':
                                color_rect = [255, 0, 0]
                                cv2.rectangle(frame, (x, y), (x1, y1), color_rect, 2)


                    # check if the video writer is None
                    if writer is None:
                        # initialize our video writer
                        fourcc = cv2.VideoWriter_fourcc(*'MPEG')
                        writer = cv2.VideoWriter(os.path.join(output_dir, video_name_without_ext + 'out.'+str('wmv')), fourcc, 30,
                                                 (frame.shape[1], frame.shape[0]), True)

                    # write the output frame to disk
                    writer.write(frame)
                    frameIndex += 1

                    if frameIndex >= 100:
                        print("[INFO] cleaning up...")
                        writer.release()
                        vs.release()
                        exit()

                # release the file pointers
                print("[INFO] cleaning up...")
                writer.release()
                vs.release()
                print("[INFO] processing video of {} is completed".format(video_name))
            # except:
            #     pass

                df_combine_labels_analysis.to_csv(os.path.join(output_dir, "Labels_Analysis.csv"), index=False)
                total_p = df_combine_labels_analysis['total_P'].sum()
                total_im = df_combine_labels_analysis['total_IM'].sum()
                total_np = df_combine_labels_analysis['total_NP'].sum()
                print(total_p, total_im, total_np)

                if (total_p > 0 and total_im > 0 and total_np > 0):
                    perc_np = round((total_np/(total_np + total_p + total_im))*100,2)
                    perc_p = round((total_p/(total_np + total_p + total_im))*100,2)
                    perc_im = round((total_im/(total_np + total_p + total_im))*100, 2)
                else :
                    perc_np = 0
                    perc_p = 0
                    perc_im = 0
                print(perc_np, perc_p, perc_im)
                video_c = len(df_combine_labels_analysis.video_name.unique())
                print(len(complete_morph))
                print(len(complete_prog))
                summary_image = get_summary_image(total_p, total_np, total_im, perc_p, perc_np, perc_im, video_c, complete_morph, complete_prog)

                df_combine_locations = df_combine_locations.sort_values(by=['id', 'frame_num'])
                df_combine_locations = df_combine_locations[['video_name', 'id','label','frame_num','xmin','ymin','xmax','ymax']]
                df_combine_locations.to_csv(os.path.join(output_dir, "Detailed.csv"), index=False)
                video_processed_count = len(df_combine_locations['video_name'].unique())
                df_summary = df_combine_locations.copy()
                df_summary = df_summary[df_summary['label'] == 'progressive']
                print(df_summary.columns)
                df_summary = df_summary[['id', 'video_name']]
                df_summary = df_summary.rename(columns={"id": "Id Number", "video_name": "Video Label"})

                df_summary = df_summary.drop_duplicates(keep='first')
                df_summary = df_summary.sort_values(by =['Video Label'])

                df_summary.to_csv(os.path.join(output_dir, "Summary.csv"), index=False)

                with open(os.path.join(output_dir, "Summary.csv"), 'r+') as f:
                    content = f.read()
                    f.seek(0, 0)
                    f.write("Id Number" + ',' + str("Video Label") +  '\n'  + content)
                    # f.write(' ' + ',' + ' ' + ',' + ' ' + ',' + ' '+ ',' + ' ' +  ',' +  ' ' + ',' + ' ' + ',' + ' ' +  '\n' + content)
                    f.close()
                #
                df_summary = pd.read_csv(os.path.join(output_dir, "Summary.csv"))

                fig, ax = plt.subplots(figsize=(12, 4), )
                ax.axis('auto')
                ax.axis('off')
                # ax.
                the_table = ax.table(cellText=df_summary.values, colWidths=[0.1] * 3, loc='center', )
                pp = PdfPages(os.path.join(output_dir, "Summary.pdf"))
                txt = 'Summary Report'
                plt.text(0.42, 0.85, txt, transform=fig.transFigure, size=20)
                txt = 'Date  ' + str(date.today()) + '  (Videos Processed: ' + str(video_processed_count) + ')'
                plt.text(0.45, 0.78, txt, transform=fig.transFigure, size=5)
                # rect = patches.Rectangle((10,10),40,30,linewidth=1,edgecolor='r',facecolor='none')
                # ax.add_patch(rect)
                txt = 'Progressive'
                plt.text(0.48, 0.65, txt, transform=fig.transFigure, size=8)
                        # txt = 'Videos'
                # plt.text(0.53, 0.72, txt, transform=fig.transFigure, size=10)

                pp.savefig(fig, bbox_inches='tight', )
                pp.close()


                cv2.imwrite(os.path.join(output_dir, "Summary.jpg"), summary_image)
                os.remove(os.path.join(output_dir, "Summary.csv"))

    # except:
    #     pass

path = os.path.join(output_dir, 'uploadcomplete.txt')
uploadcomplete = open(path, 'w+')
uploadcomplete.write('This write is complete')
uploadcomplete.close()

import shutil
try:
    shutil.rmtree(temp_folder)
    shutil.rmtree(temp_input)
except:
    pass

os.system("gsutil cp -r {} {}".format(output_dir, args['gcs_output_path']))





