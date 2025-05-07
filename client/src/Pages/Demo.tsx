import React, { useState, useEffect } from "react";
import axios from "axios";

import * as compute from "@google-cloud/compute";
import { CircularProgress, Typography } from "@mui/material";
import { Memory, PlayCircle, StopCircle } from "@mui/icons-material";
import { compute_v1 } from "googleapis";

const DemoStatus = () => {
  const [loading, setLoading] = useState(false);
  const [VMs, setVMs] = useState(null);
  const [runningVMs, setrunningVMs] = useState<
    compute_v1.Schema$Instance[] | null
  >(null);
  const [assemblies, setAssemblies] = useState(null);
  const [runningAssem, setRunningAssem] = useState(null);

  const getStatus = async () => {
    setLoading(true);
    let results = await axios.get("http://localhost:5000/api/admin/gce");
    let assemblies = await axios.get(
      "http://localhost:5000/api/admin/transloadit"
    );
    setVMs(results.data);
    setAssemblies(assemblies.data.items);
    setLoading(false);
  };

  const filterStatus = () => {
    if (VMs) {
      console.log("VMs", VMs);
      const running = VMs.filter((vm) => vm.status === "RUNNING");
      setrunningVMs(VMs);
      setLoading(false);
    }
    if (assemblies) {
      const inProcess = assemblies.filter(
        (assem) => assem.ok === "ASSEMBLY_EXECUTING"
      );
      setRunningAssem(inProcess);
      setLoading(false);
    }
  };
  useEffect(() => {
    getStatus();
  }, []);

  useEffect(() => {
    if (VMs) {
      filterStatus(VMs);
    }
  }, [VMs, assemblies]);
  return loading ? (
    <div className="my-5 mx-auto text-center">
      <CircularProgress />
    </div>
  ) : (
    <div className="w-100 mt-5">
      <h3>Status</h3>
      {runningVMs &&
      runningVMs.length === 0 &&
      runningAssem &&
      runningAssem.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <h4 className="text-center">
              No Records Being Currently Processed
            </h4>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-6 col-12">
            <h4 className="mb-3">
              Compute Instances {runningVMs && `(${runningVMs.length})`}
            </h4>
            {runningVMs &&
              runningVMs.length > 0 &&
              runningVMs.map((vm, index) => (
                <Typography
                  key={vm.id}
                  sx={{ display: "inline-flex", alignItems: "center" }}
                >
                  <Memory
                    color={vm.status === "RUNNING" ? "success" : "info"}
                  />
                  {vm.name}
                  {vm.status === "RUNNING" ? (
                    <PlayCircle sx={{ marginLeft: "5px" }} color="success" />
                  ) : (
                    <StopCircle sx={{ marginLeft: "5px" }} color="disabled" />
                  )}
                </Typography>
              ))}
          </div>
          <div className="col-lg-6 col-12">
            <h4 className="mb-3">
              Running Assemblies {runningAssem && `(${runningAssem.length})`}
            </h4>
            {runningAssem &&
              runningAssem.length > 0 &&
              runningAssem.map((assem, index) => (
                <p key={assem.id}>
                  <FontAwesomeIcon
                    className="mr-3"
                    icon={faCubes}
                    color={assem.ok === "ASSEMBLY_COMPLETED" ? "green" : "gray"}
                  />
                  {assem.id}
                </p>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoStatus;
