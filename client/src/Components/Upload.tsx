import axios from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import Uppy, { Meta, UploadResult } from "@uppy/core";
import Transloadit from "@uppy/transloadit";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { Record } from "../@types/record";
import { Navigate, useMatch, useNavigate, useParams } from "react-router";
import { Box, Button, CircularProgress } from "@mui/material";
import { Dashboard } from "@uppy/react";
import { Link } from "react-router-dom";
import { Auth } from "../@types/auth";
import { AuthContext } from "../context/AuthContext";
import { useAuth } from "../hooks/useAuth";

interface Specimen {
  user_id: string;
  encoded: string;
  thumb: string;
  info: Meta;
  recordId: string;
}
interface DocUploadProps {
  record: Record | null;
  setRecord: Function;
  toggleUpload: boolean;
  setToggleUpload: Function;
}
const DocUpload = ({
  record,
  setRecord,
  toggleUpload,
  setToggleUpload,
}: DocUploadProps) => {
  console.log(import.meta.env.VITE_TRANSLOADIT_AUTH_KEY);
  const [uppy] = useState(() =>
    new Uppy({
      debug: true,
      allowMultipleUploads: true,
      restrictions: {
        maxNumberOfFiles: 25,
        maxFileSize: 35000000,
        allowedFileTypes: [".mp4"],
      },
    }).use(Transloadit, {
      assemblyOptions: {
        params: {
          auth: { key: import.meta.env.VITE_TRANSLOADIT_AUTH_KEY },
          template_id: import.meta.env.VITE_TRANSLOADIT_TEMPLATE_ID,
        },
      },
      waitForEncoding: true,
      limit: 1,
    })
  );

  const isAuthenticated = useAuth();
  const { user, loggedIn, token, login, setMessage, isLoading } = useContext(
    AuthContext
  ) as Auth;
  const navigate = useNavigate();
  const { id } = useParams();
  const [visible, setVisible] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [upload, setUpload] = useState(false);
  const [uploaded, setUploaded] = useState<boolean | null>(null);

  const cancelRecord = async (
    event: React.MouseEvent<HTMLButtonElement>,
    record: Record
  ) => {
    try {
      const deleted = await axios.delete(
        `http://localhost:5000/api/records/${record.id}`
      );
      console.log("Record deleted successfully:", deleted.data);
      setRecord(null);
      setToggleUpload(!toggleUpload);
    } catch (err) {
      console.log(err);
    }
  };

  const finish = async () => {
    if (!record || !user) return;
    try {
      if (!uploaded) {
        await axios.put(
          `http://localhost:5000/api/records/${record.id}/upload/finish`,
          {
            recordId: record.id,
            userId: user._id,
            uploaded: true,
          }
        );
        setUploaded(true);
      }
      if (visible) {
        setVisible(!visible);
      }
    } catch (err) {
      console.log("Error: " + err);
    }
  };

  uppy.on("error", (error) => {
    console.log(error);
  });
  useEffect(() => {
    if (record && user) {
      setUpload(true);
    }
  }, [record, user]);

  useEffect(() => {
    if (!record || !user) return;
    uppy.on("complete", (result) => {
      console.log(result);
      let array: Specimen[] = [];
      const transloaditResult = result.transloadit as { [key: string]: any }[];
      const results = transloaditResult[0].results;
      const encoded = results[":original"];
      const thumbs = results.thumb;

      console.log(result);
      encoded.forEach((vid: { ssl_url: string; original_basename: string }) => {
        let thumbMatch = thumbs.find(
          (thumb: { original_basename: string; ssl_url: string }) =>
            thumb.original_basename === vid.original_basename
        );
        let obj: Specimen = {
          user_id: user._id,
          encoded: vid.ssl_url,
          info: vid,
          thumb: thumbMatch?.ssl_url || "",
          recordId: record.id,
        };

        array.push(obj);
      });
      if (!record) return;
      if (upload) {
        array.forEach((specimen) => {
          const { user_id, encoded, thumb, info, recordId } = specimen;
          axios
            .put(`http://localhost:5000/api/records/${record.id}/upload`, {
              user_id,
              encoded,
              thumb,
              info,
              recordId,
            })
            .then((res) => {
              setRecord(res.data);
            })
            .catch((err) => console.log("Error: " + err));
        });
      }
      setSuccessful(true);
    });
  }, [upload, record, user?.id]);

  if (!isAuthenticated && !isLoading && !user) {
    return <Navigate to="/login" />;
  }

  return isLoading ? (
    <div className="my-5 mx-auto text-center">
      <CircularProgress />
    </div>
  ) : (
    <>
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Box sx={{ p: 3, border: "1px solid #ccc", borderRadius: 2 }}>
          <h3>Specimen Upload</h3>
          <Box>
            {visible && (
              <Button
                onClick={() => setVisible(!visible)}
                sx={{ mb: 5 }}
                variant="contained"
                color={successful ? "success" : "error"}
                className="btn btn-success mb-5"
              >
                {!successful ? "Cancel" : "Done"}
              </Button>
            )}
            {!visible && record && record.specimens.length === 0 && (
              <>
                <Button
                  onClick={() => setVisible(!visible)}
                  variant="contained"
                  color="success"
                  sx={{ mt: 3, mb: 5, mr: 3 }}
                >
                  Begin Upload
                </Button>
                <Button
                  onClick={(event) => cancelRecord(event, record)}
                  variant="contained"
                  color="error"
                  sx={{ mt: 3, mb: 5 }}
                >
                  Cancel
                </Button>
              </>
            )}
            {record && !visible && record.specimens.length > 0 && (
              <>
                <Button
                  onClick={() => setVisible(!visible)}
                  variant="contained"
                  color="success"
                  sx={{ mt: 3, mb: 3, mr: 3 }}
                >
                  Upload More
                </Button>
                <Button
                  component={Link}
                  to={`/samples`}
                  onClick={() => finish()}
                  variant="contained"
                  color="warning"
                  sx={{ mt: 3, mb: 3 }}
                >
                  Finish
                </Button>
              </>
            )}
          </Box>
          {visible && (
            <Dashboard
              uppy={uppy}
              showProgressDetails={true}
              width={"75%"}
              height={400}
            />
          )}
        </Box>
      </Box>
    </>
  );
};

export default DocUpload;
