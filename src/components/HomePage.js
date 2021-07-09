import { Avatar, Button, Fab } from "@material-ui/core";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import React from "react";
import AppBar from "@material-ui/core/AppBar";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import { deepOrange } from "@material-ui/core/colors";
import VideoCallIcon from "@material-ui/icons/VideoCall";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1, 0, 5),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  cardMedia: {
    paddingTop: "56.25%", // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  extendedIcon: {
    marginRight: theme.spacing(1),
  },
  fab: {
    position: "fixed",
    bottom: theme.spacing(8),
    right: theme.spacing(8),
  },
}));

export default function HomePage() {
  const [createTeamOpen, setCreateTeamOpen] = useState(false);
  const [joinTeamOpen, setJoinTeamOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamCode, setTeamCode] = useState("");
  const [teams, setTeams] = useState([]);
  const classes = useStyles();
  const history = useHistory();

  useEffect(() => {
    if (!Cookies.get("token")) {
      history.push("/");
    }
  }, [history]);

  useEffect(() => {
    loadTeams();
  }, []);
  const onJoinTeam = () => {
    var axios = require("axios");

    var config = {
      method: "post",
      url: `/api/secure/teams/${teamCode}`,
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setJoinTeamOpen(false);
        loadTeams();
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  const onCreateTeam = () => {
    var data = JSON.stringify({ name: teamName });

    var config = {
      method: "put",
      url: "/api/secure/teams/",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setCreateTeamOpen(false);
        loadTeams();
      })
      .catch(function (error) {
        console.log(error);
      });
  };
  function loadTeams() {
    console.log("bla");
    var config = {
      method: "get",
      url: "/api/secure/teams/",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        setTeams(response.data);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function onCreateCall() {
    var win = window.open(
      `/vc/${Math.random().toString(36).substring(7)}`,
      "_blank"
    );
  }

  const handleCreateOpen = () => {
    setCreateTeamOpen(true);
  };

  const handleCreateClose = () => {
    setCreateTeamOpen(false);
  };

  const handleJoinOpen = () => {
    setJoinTeamOpen(true);
  };

  const handleJoinClose = () => {
    setJoinTeamOpen(false);
  };

  return (
    <>
      <Fab
        variant="extended"
        className={classes.fab}
        color="primary"
        onClick={onCreateCall}
      >
        <VideoCallIcon className={classes.extendedIcon} />
        Start Instant Call
      </Fab>
      <div>
        <Dialog
          open={createTeamOpen}
          onClose={handleCreateClose}
          aria-labelledby="form-dialog-title"
          maxWidth="xs"
          fullWidth={true}
        >
          <DialogTitle id="form-dialog-title">Create New Team</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Team Name"
              fullWidth
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateClose} color="primary">
              Cancel
            </Button>
            <Button onClick={onCreateTeam} color="primary">
              Create Team
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={joinTeamOpen}
          onClose={handleJoinClose}
          aria-labelledby="form-dialog-title"
          maxWidth="xs"
          fullWidth={true}
        >
          <DialogTitle id="form-dialog-title">Join existing team</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Team Code"
              fullWidth
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleJoinClose} color="primary">
              Cancel
            </Button>
            <Button onClick={onJoinTeam} color="primary">
              Join Team
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <CssBaseline />
      <AppBar style={{ alignItems: "center" }} position="relative">
        <Toolbar>
          <Typography variant="h4" color="inherit" noWrap>
            Relier
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Container className={classes.cardGrid} maxWidth="md">
          {/* End hero unit */}
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card
                className={classes.card}
                style={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <CardContent
                  style={{
                    alignItems: "center",
                    display: "flex",
                    // flexDirection: "column",
                    justifyContent: "center",
                    paddingBottom: 0,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleCreateOpen}
                  >
                    Create Team
                  </Button>
                </CardContent>
                <CardContent
                  style={{
                    alignItems: "center",
                    display: "flex",
                    // flexDirection: "column",
                    justifyContent: "center",
                    // paddingBottom: 0,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleJoinOpen}
                  >
                    Join Team
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            {teams.map((team) => (
              <Grid item key={team.id} xs={12} sm={6} md={4}>
                <Card className={classes.card}>
                  <CardContent
                    style={{
                      alignItems: "center",
                      display: "flex",
                      // flexDirection: "column",
                      paddingBottom: 0,
                      justifyContent: "center",
                    }}
                  >
                    <Avatar className={classes.orange} variant="square">
                      {team.name.substring(0, 1)}
                    </Avatar>
                  </CardContent>
                  <CardContent
                    className={classes.cardContent}
                    style={{ paddingBottom: 0 }}
                  >
                    <Typography gutterBottom variant="h5" component="h2">
                      {team.name}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Leave
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
    </>
  );
}
