import React, { useState, useEffect } from "react";
import axios from "axios";

import * as compute from "@google-cloud/compute";
import {
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  StepContent,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle } from "@mui/icons-material";
import { compute_v1 } from "googleapis";
import DocUpload from "../Components/Upload";
import { Record } from "../@types/record";
import { AssemblyResponse, AssemblyResult } from "@uppy/transloadit";

interface NetworkResourceObject {
  id: string;
  name: string;
  status: string;
  type: string;
}

enum ComponentLabel {
  UPLOAD = "upload",
  ASSEMBLY = "assembly",
  CLOUD = "cloud",
  PUBSUB = "pubsub",
  VM = "vm",
}
interface StepType {
  label: string;
  componentLabel: ComponentLabel;
  completed: boolean;
}
const Demo = () => {
  const [loading, setLoading] = useState(false);
  const [VMs, setVMs] = useState<compute_v1.Schema$Instance[] | null>(null);
  const [runningVMs, setRunningVMs] = useState<
    compute_v1.Schema$Instance[] | null
  >(null);
  const [assemblies, setAssemblies] = useState<AssemblyResponse[] | null>(null);
  const [assemblyUrl, setAssemblyUrl] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<any>(null);
  const [currentAssembly, setCurrentAssembly] =
    useState<AssemblyResponse | null>(null);
  const [runningAssem, setRunningAssem] = useState<
    NetworkResourceObject[] | null
  >(null);
  const [activeStep, setActiveStep] = useState(0);
  const [record, setRecord] = useState<Record | null>(null);
  const [markedAsComplete, setMarkedAsComplete] = useState(false);
  const [getStarted, setGetStarted] = useState(false);

  const [steps, setSteps] = useState<StepType[]>([
    {
      label: "upload specimens",
      componentLabel: ComponentLabel.UPLOAD,
      completed: false,
    },
    {
      label: "create assembly",
      componentLabel: ComponentLabel.ASSEMBLY,
      completed: false,
    },
    {
      label: "run cloud function",
      componentLabel: ComponentLabel.CLOUD,
      completed: false,
    },
    {
      label: "trigger pub/sub",
      componentLabel: ComponentLabel.PUBSUB,
      completed: false,
    },
    {
      label: "create/start virtual machine",
      componentLabel: ComponentLabel.VM,
      completed: false,
    },
  ]);

  const createRecord = async () => {
    if (!import.meta.env.VITE_DEMO_USER_ID) return;
    try {
      const record = await axios.post("http://localhost:5000/api/records/new", {
        id: uuidv4(),
        userid: import.meta.env.VITE_DEMO_USER_ID,
      });
      console.log("Record created successfully:", record.data);
      setRecord(record.data);
    } catch (error) {
      console.error("Error creating record:", error);
    }
  };
  const getAssemblyStatus = async () => {
    if (!assemblyUrl) return;
    try {
      const response = await axios.get(assemblyUrl);
      const assemblyResult = response.data as AssemblyResponse;
      setCurrentAssembly(assemblyResult);
      console.log("Assembly result:", assemblyResult);
      if (assemblyResult.ok === "ASSEMBLY_COMPLETED") {
        setSteps((prevSteps) => {
          const updatedSteps = [...prevSteps];
          updatedSteps[1].completed = true;
          return updatedSteps;
        });
      }
    } catch (error) {
      console.error("Error getting assembly status:", error);
    }
  };

  const createTask = async () => {
    if (!record) return;
    const task = {
      id: record.id,
      userid: import.meta.env.VITE_DEMO_USER_ID,
      fields: record.specimens.length,
    };
    const data = await axios.post(
      "http://localhost:5000/api/records/task",
      task
    );

    // const subscription = pubsubClient.topic('mern-redux-topic').subscription(
    //   "mern-redux-subscription"
    // ).

    console.log("Task created successfully:", data.data);

    const eventSource = new EventSource(
      "http://localhost:5000/api/admin/messages/"
    );

    const dataArray = [];
    eventSource.onmessage = (event) => {
      console.log(event);
      const data = JSON.parse(event.data);
      console.log("Event data:", data);
      dataArray.push(data);
      setTaskData(dataArray);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  };
  const getStatus = async () => {
    setLoading(true);
    try {
      const results = await axios.get("http://localhost:5000/api/admin/gce");
      const assemblies = await axios.get(
        "http://localhost:5000/api/admin/transloadit",
        {
          params: {
            recordId: record?.id,
          },
        }
      );
      console.log(results, assemblies);
      console.log("VMs", results.data);
      setVMs(results.data);
      setAssemblies(assemblies.data.items);
      setLoading(false);
    } catch (error) {
      console.error("Error getting status:", error);
      setLoading(false);
    }
  };

  const loadTopics = async () => {
    console.log("loading topics");
    // const pubSubClient = new PubSub();
    // const topics = await pubSubClient.getTopics();
    // console.log("Topics:", topics);
    // const topic = pubSubClient.topic("mern-redux-topic");
    // console.log("Topic:", topic);
  };

  const GetStarted = () => {
    return (
      <Box>
        <Typography variant="h6">Get Started</Typography>
        <Typography variant="body1">
          This application is built with React and Material UI on the front-end,
          node.js, Express, and MongoDB on the backend, and Google Cloud
          Platform. Users can upload videos using the Uppy dashboard. Those
          files are transcoded using Transloadit, with the videos stored in a
          Google Storage bucket and the metadata stored in a MongoDB database.
          After a successful upload, the new records trigger a Google Cloud
          Function that creates a virtual machine instance on Google Compute
          Engine. The VM instance runs a script that processes the video files
          and stores the results in the database. The application also uses
          Google Pub/Sub to trigger the cloud function and manage the workflow.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          To get started with the demo, click the button below to create a new
          record. This will allow you to upload your specimens and start the
          process.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setGetStarted(true);
            createRecord();
          }}
          sx={{ mt: 2 }}
        >
          Get Started
        </Button>
      </Box>
    );
  };

  const ViewAssembly = () => {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">View Assembly</Typography>
        <Typography variant="body1">
          This is where you can view the assembly status and details.
        </Typography>
        {currentAssembly && (
          <Card key={currentAssembly.assembly_id} sx={{ margin: 2 }}>
            {currentAssembly.ok === "ASSEMBLY_COMPLETED" && (
              <>
                {"Assembly completed successfully!"}
                <CheckCircle color="success" />
              </>
            )}
            <CardContent>
              <Typography variant="h6">{currentAssembly.instance}</Typography>
              <Typography variant="body1">
                Status: {currentAssembly.account_id}
              </Typography>
              <Typography variant="body1">
                Created: {currentAssembly.execution_start}
              </Typography>
              <Typography variant="body1">
                Completed: {currentAssembly.last_job_completed}
              </Typography>
              <Typography variant="body1">
                Duration: {currentAssembly.execution_duration}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    );
  };

  const ViewPipeline = () => {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">View Pipeline</Typography>
        <Typography variant="body1">
          This is where you can view the pipeline status and details.
        </Typography>
      </Box>
    );
  };
  const DemoUpload = () => {
    return (
      <Box sx={{ padding: 2 }}>
        <DocUpload
          demo={true}
          record={record}
          toggleUpload={getStarted}
          setRecord={setRecord}
          setToggleUpload={setGetStarted}
          handleNext={handleNext}
          setAssemblyUrl={setAssemblyUrl}
          markAsComplete={markAsComplete}
          activeStep={activeStep}
          markedAsComplete={markedAsComplete}
        />
      </Box>
    );
  };

  const TaskViews = () => {
    return (
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Task Views</Typography>
        <Typography variant="body1">
          This is where you can view the task status and details.
        </Typography>
        {taskData &&
          taskData.map((task: any, index: number) => (
            <Card key={index} sx={{ margin: 2 }}>
              <CardContent>
                <Typography variant="h6">{task.id}</Typography>
                <Typography variant="body1">Status: {task.userid}</Typography>
                <Typography variant="body1">Created: {task.fields}</Typography>
                <Typography variant="body1">
                  Duration: {task.duration}
                </Typography>
              </CardContent>
            </Card>
          ))}
      </Box>
    );
  };

  const componentMap = {
    upload: <DemoUpload />,
    assembly: <ViewAssembly />,
    cloud: <TaskViews />,
    pubsub: <TaskViews />,
    vm: <TaskViews />,
  };

  const filterStatus = () => {
    if (VMs) {
      const running = VMs.filter((vm) => vm.status === "RUNNING");
      setRunningVMs(running);
      setLoading(false);
    }
    if (assemblies) {
      const inProcess = assemblies.filter(
        (assem) => assem.status === "ASSEMBLY_EXECUTING"
      );
      setRunningAssem(inProcess);
      setLoading(false);
    }
  };

  useEffect(() => {
    getStatus();
  }, []);

  useEffect(() => {
    if (steps[activeStep].label === "create assembly") {
      getAssemblyStatus();
    }
    if (steps[activeStep].label === "run cloud function") {
      createTask();
    }
    if (steps[activeStep].label === "trigger pub/sub") {
      loadTopics();
    }
  }, [activeStep]);
  useEffect(() => {
    if (VMs) {
      filterStatus();
    }
  }, [VMs, assemblies]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const markAsComplete = (index: number) => {
    const updatedSteps = [...steps];
    updatedSteps[index].completed = true;
    setSteps(updatedSteps);
    setActiveStep(index);
    setMarkedAsComplete(true);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  return loading ? (
    <Box sx={{ my: 5, mx: "auto", textAlign: "center" }}>
      <CircularProgress />
    </Box>
  ) : (
    <Box sx={{ width: "100%", mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Application Demo
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ padding: 2 }}>
            {!getStarted ? (
              <GetStarted />
            ) : (
              <>
                <Stepper activeStep={activeStep}>
                  {steps.map(({ label }, index) => (
                    <Step key={index}>
                      <StepLabel
                        sx={{
                          ".MuiStepLabel-labelContainer": { color: "#444" },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <Box sx={{ display: "flex", flexDirection: "column", pt: 2 }}>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    {componentMap[steps[activeStep].componentLabel]}
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      color="inherit"
                      variant="contained"
                      disabled={activeStep === 0 && getStarted}
                      onClick={handleBack}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Box sx={{ flex: "1 1 auto" }} />
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      disabled={!steps[activeStep].completed}
                    >
                      {activeStep === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Demo;
