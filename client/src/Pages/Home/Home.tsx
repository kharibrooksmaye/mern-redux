import { Box, Grid, Typography } from "@mui/material";

import React from "react";
import CommonButton from "../../Components/Common/CommonButton/CommonButton";

const boxShadow =
  "rgb(145 158 171 / 20%) 0px 0px 2px 0px, rgb(145 158 171 / 12%) 0px 12px 24px -4px";
const Home = () => {
  return (
    <Grid container>
      <Grid item xs={12}>
        <Box
          sx={{
            padding: "100px",
            margin: "50px",
            borderRadius: "20px",
            backgroundColor: "primary.light",
            boxShadow,
            textAlign: "left",
          }}
        >
          <Typography variant="h4" component="h1" color="primary.contrast">
            A Typescript React Application
          </Typography>
          <Typography
            sx={{ marginTop: "20px" }}
            variant="h5"
            component="h1"
            color="primary.dark"
          >
            Learning Statically Typed Javascript while mastering React and MUI
          </Typography>
          <CommonButton
            variant="contained"
            color="secondary"
            size="large"
            sx={{ marginTop: "20px" }}
          >
            Get Started
          </CommonButton>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box
          sx={{
            padding: "100px",
            margin: "50px",
            borderRadius: "20px",
            backgroundColor: "success.lighter",
            boxShadow,
            textAlign: "left",
            lineHeight: "1.5px",
          }}
        >
          <Typography variant="h5" component="h1">
            Statically Typed
          </Typography>
          <Typography variant="body1" component="h1">
            JavaScript is a dynamically typed language which means that the
            types are checked, and datatype errors are spotted only at the
            runtime. Runtime type checking is not, per se, a disadvantage: It
            offers more flexibility, enabling program components to adapt and
            change on the fly. But the larger the project and the team, the more
            undefined variables are added and the more potential mistakes the
            code amasses. TypeScript introduces optional strong static typing:
            Once declared, a variable doesn’t change its type and can take only
            certain values. The compiler alerts developers to type-related
            mistakes, so they have no opportunity to hit the production phase.
            This results in less error-prone code and better performance during
            execution.
          </Typography>
          <CommonButton
            variant="contained"
            color="primary"
            size="large"
            sx={{ marginTop: "20px" }}
          >
            Learn More
          </CommonButton>
        </Box>
      </Grid>
      <Grid item xs={6}>
        <Box
          sx={{
            padding: "100px",
            margin: "50px",
            borderRadius: "20px",
            backgroundColor: "warning.lighter",
            boxShadow,
            textAlign: "left",
            lineHeight: "1.5px",
          }}
        >
          <Typography variant="h5" component="h1">
            Statically Typed
          </Typography>
          <Typography variant="body1" component="h1">
            JavaScript is a dynamically typed language which means that the
            types are checked, and datatype errors are spotted only at the
            runtime. Runtime type checking is not, per se, a disadvantage: It
            offers more flexibility, enabling program components to adapt and
            change on the fly. But the larger the project and the team, the more
            undefined variables are added and the more potential mistakes the
            code amasses. TypeScript introduces optional strong static typing:
            Once declared, a variable doesn’t change its type and can take only
            certain values. The compiler alerts developers to type-related
            mistakes, so they have no opportunity to hit the production phase.
            This results in less error-prone code and better performance during
            execution.
          </Typography>
          <CommonButton
            variant="contained"
            color="secondary"
            size="large"
            sx={{ marginTop: "20px" }}
          >
            View Tutorial
          </CommonButton>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Home;
