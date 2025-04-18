import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Record } from "../../@types/record";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { Check, Info, Inventory, Pending, Upload } from "@mui/icons-material";
import DocUpload from "../../Components/Upload";
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../context/AuthContext";
import { Auth } from "../../@types/auth";
import { subscriptionTiers } from "../../Components/Constants/subscriptionTiers";

const Samples = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [record, setRecord] = useState<Record | null>(null);
  const [toggleUpload, setToggleUpload] = useState(false);
  const [toggleView, setToggleView] = useState(false);

  const { user } = useContext(AuthContext) as Auth;

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await axios.get<Record[]>(
          "http://localhost:5000/api/records"
        );
        setRecords(response.data);
      } catch (error) {
        console.error("Error fetching records:", error);
      }
    };

    fetchRecords();
  }, []);

  const createRecord = async () => {
    if (!user) return;
    try {
      const record = await axios.post("http://localhost:5000/api/records/new", {
        id: uuidv4(),
        userid: user._id,
      });
      console.log("Record created successfully:", record.data);
      setRecord(record.data);
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };

  const labels = (record: Record) => {
    return [
      { label: "Record ID", value: record.id },
      { label: "Uploaded", value: record.uploaded ? "Yes" : "No" },
      { label: "User ID", value: record.userid },
      {
        label: "Created At",
        value: new Date(record.createdAt).toLocaleString(),
      },
      {
        label: "Updated At",
        value: new Date(record.updatedAt).toLocaleString(),
      },
    ];
  };

  const userTier = subscriptionTiers.find(
    (tier) => tier.stripeLookup === user?.subscription
  );

  const remainingUploads =
    userTier && userTier.samples ? userTier.samples - records.length : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Samples
      </Typography>
      {!toggleView && !toggleUpload && (
        <Card
          sx={{
            borderRadius: "8px",
            padding: "16px",
            margin: "8px",
            textAlign: "center",
          }}
        >
          <CardContent sx={{ display: "inline-flex", flexDirection: "column" }}>
            {records.length === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  No samples available
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Upload samples to get started.
                </Typography>
              </>
            )}

            {userTier?.stripeLookup !== "gold_monthly" && (
              <Alert
                icon={<Info fontSize="medium" />}
                severity="info"
                sx={{ display: "inline-flex" }}
              >
                {userTier
                  ? `You can upload ${remainingUploads} more sample(s) with your current subscription tier (${userTier.stripeLookup}).`
                  : "Unable to determine your subscription tier."}
              </Alert>
            )}

            <Button
              variant="contained"
              color="success"
              startIcon={<Upload />}
              sx={{ marginTop: 2, alignSelf: "center" }}
              onClick={() => {
                console.log("Upload samples button clicked");
                // Add your upload logic here
                setToggleUpload(!toggleUpload);
                createRecord();
              }}
            >
              Upload Samples
            </Button>
          </CardContent>
        </Card>
      )}
      {!toggleUpload && (
        <Box sx={{ padding: "16px" }}>
          {records.length > 0 && (
            <Grid container spacing={3}>
              {records.map((recordItem) => (
                <Grid item xs={12} sm={6} md={4} key={recordItem.id}>
                  <Card
                    sx={{
                      borderRadius: "8px",
                      padding: "16px",
                      margin: "8px",
                      ...(record?.id === recordItem.id && {
                        border: "1px solid #ccc",
                      }),
                    }}
                  >
                    <CardContent>
                      {recordItem.uploaded ? (
                        <IconButton
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "green",
                            color: "white",
                            margin: "10px auto",
                            padding: 1,
                          }}
                          color="success"
                        >
                          <Inventory sx={{ fontSize: 20 }} />
                        </IconButton>
                      ) : (
                        <IconButton
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "red",
                            color: "white",
                            margin: "10px auto",
                            padding: 1,
                          }}
                          color="error"
                        >
                          <Pending sx={{ fontSize: 20 }} />
                        </IconButton>
                      )}
                      {labels(recordItem).map((item, index) => (
                        <Typography
                          key={index}
                          variant={
                            item.label.includes("At") ? "body2" : "body1"
                          }
                          color={
                            item.label.includes("At")
                              ? "textSecondary"
                              : "inherit"
                          }
                          gutterBottom={item.label === "Record ID"}
                        >
                          {item.label}: {item.value}
                        </Typography>
                      ))}
                    </CardContent>
                    <CardActions>
                      {recordItem.uploaded ? (
                        <>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{ margin: "16px" }}
                            onClick={() => {
                              console.log("View record button clicked");
                              setRecord(toggleView ? null : recordItem);
                              setToggleView(
                                record?.id === recordItem.id
                                  ? !toggleView
                                  : true
                              );
                            }}
                          >
                            {record?.id === recordItem.id && toggleView
                              ? "Hide "
                              : "View "}{" "}
                            Record
                          </Button>
                          <Button
                            variant="contained"
                            color="warning"
                            sx={{ margin: "16px" }}
                            onClick={() => {
                              console.log("Delete record button clicked");
                              // Add your edit logic here
                            }}
                          >
                            Delete Record
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          color="secondary"
                          sx={{ margin: "16px" }}
                          onClick={() => {
                            console.log("Upload file button clicked");
                            // Add your upload logic here
                            setToggleUpload(!toggleUpload);
                            setRecord(record);
                          }}
                        >
                          Upload Samples
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
      {toggleUpload && (
        <DocUpload
          record={record}
          setRecord={setRecord}
          toggleUpload={toggleUpload}
          setToggleUpload={setToggleUpload}
        />
      )}

      {record?.uploaded && toggleView && (
        <Grid container spacing={3} sx={{ padding: "16px" }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Samples for Record ID: {record.id}
          </Typography>
          <Grid item sx={{ padding: "16px" }}>
            {record.specimens.map((specimen, index) => (
              <Card
                key={index}
                sx={{
                  borderRadius: "8px",
                  padding: "16px",
                  margin: "8px",
                }}
              >
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    Specimen #{index + 1}
                  </Typography>
                  <video src={specimen.encoded} controls width="100%" />
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Samples;
