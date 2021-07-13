import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { deepOrange } from "@material-ui/core/colors";
import AddIcon from "@material-ui/icons/Add";
import ShareIcon from "@material-ui/icons/Share";
import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import axios from "axios";
import Cookies from "js-cookie";
import { io } from "socket.io-client";
import jwt_decode from "jwt-decode";
import { Link, useHistory, useParams } from "react-router-dom";
import VideoCall from "@material-ui/icons/VideoCall";
import Videocam from "@material-ui/icons/Videocam";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: "relative",
    height: "100vh",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
  },
  drawerPaperClose: {
    overflowX: "hidden",
    position: "relative",
    height: "100vh",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    maxWidth: 900,
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  fixedHeight: {
    height: 240,
  },
  bottomToolbar: {
    position: "absolute",

    paddingTop: "0",
    bottom: "0",
    left: "0",
    width: 240,
    background: "#fafafa",
  },
}));

const socket = io().connect();

export default function TeamPage() {
  const history = useHistory();
  const { secret } = useParams();
  const message = useRef("");
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [openChannel, setOpenChannel] = useState();
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [invite, setInvite] = useState(false);
  const [channel, setChannel] = useState("");
  const [teamName, setTeamName] = useState("");
  useEffect(() => {
    if (!Cookies.get("token")) {
      history.push("/");
    }
    findTeam();
    console.log(socket);
    socket.on("message", function (data) {
      setMessages((messages) => [...messages, data.message]);
      var element = document.getElementById("main-container");
      element.scrollTop = element.scrollHeight;
    });
    loadChannels();
    // var elmnt = document.getElementById("50");
    // elmnt.scrollIntoView();
  }, []);

  function findTeam() {
    var data = JSON.stringify({
      secret: secret,
    });

    var config = {
      method: "get",
      url: "/api/secure/teams/",
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        setTeamName(response.data[0].name);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };
  const handleCreateOpen = () => {
    setCreateChannelOpen(true);
  };

  const handleCreateClose = () => {
    setCreateChannelOpen(false);
  };

  const handleInviteOpen = () => {
    setInvite(true);
  };

  const handleInviteClose = () => {
    setInvite(false);
  };

  const onCreateChannel = () => {
    handleCreateClose();
    var data = JSON.stringify({ name: channel });
    var config = {
      method: "put",
      url: `/api/secure/channels/${secret}`,
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
        loadChannels();
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  function sendMessage(is_vc = false) {
    var d = new Date();
    let messageJSON;
    if (!is_vc) {
      messageJSON = {
        text: message.current.value,
        timestamp: new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toUTCString(),
        is_vc: is_vc,
        sender: { name: jwt_decode(Cookies.get("token")).name },
      };
    } else {
      messageJSON = {
        text: `/vc/${Math.random().toString(36).substring(7)}`,
        timestamp: new Date(d.getTime() + 5.5 * 60 * 60 * 1000).toUTCString(),
        is_vc: is_vc,
        sender: { name: jwt_decode(Cookies.get("token")).name },
      };
    }
    socket.emit("send", {
      room: openChannel,
      message: messageJSON,
    });
    var data = JSON.stringify({ text: messageJSON.text, is_vc: is_vc });
    message.current.value = "";
    var config = {
      method: "put",
      url: `/api/secure/messages/${openChannel}`,
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    axios(config)
      .then(function (response) {
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  function loadMessages(channel) {
    var config = {
      method: "get",
      url: `/api/secure/messages/${channel}`,
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    };

    axios(config)
      .then(function (response) {
        setMessages(response.data);
        var element = document.getElementById("main-container");
        element.scrollTop = element.scrollHeight;
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function loadChannels() {
    var config = {
      method: "get",
      url: `/api/secure/channels/${secret}`,
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    };

    axios(config)
      .then(function (response) {
        setChannels(response.data);
        clickChannel(response.data[0].secret);
      })
      .catch(function (error) {
        console.log(error);
      });
  }

  function clickChannel(channel) {
    if (openChannel) {
      socket.emit("unsubscribe", openChannel);
      document.getElementById(openChannel).style.backgroundColor = "";
    }

    setOpenChannel(channel);
    document.getElementById(channel).style.backgroundColor = "grey";
    socket.emit("subscribe", channel);
    loadMessages(channel);
  }
  const handleDrawerOpen = () => {
    setOpen(true);
  };
  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div className={classes.root}>
      <div>
        <Dialog
          open={createChannelOpen}
          onClose={handleCreateClose}
          aria-labelledby="form-dialog-title"
          maxWidth="xs"
          fullWidth={true}
        >
          <DialogTitle id="form-dialog-title">Create New Channel</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Team Name"
              fullWidth
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCreateClose} color="primary">
              Cancel
            </Button>
            <Button onClick={onCreateChannel} color="primary">
              Create Channel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div>
        <Dialog
          open={invite}
          onClose={handleInviteClose}
          aria-labelledby="form-dialog-title"
          maxWidth="xs"
          fullWidth={true}
        >
          <DialogTitle id="form-dialog-title">Invite to team</DialogTitle>
          <DialogContent style={{ justifyItems: "center" }}>
            <Button
              onClick={() => {
                handleInviteClose();
                let s = window.location.toString();
                navigator.clipboard.writeText(s.replace("team", "home"));
              }}
              color="primary"
            >
              Copy magic link
            </Button>
            <Button
              onClick={() => {
                handleInviteClose();
                navigator.clipboard.writeText(secret);
              }}
              color="secondary"
              style={{ paddingLeft: 12 }}
            >
              Copy team code
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInviteClose} color="primary">
              Done
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <CssBaseline />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, open && classes.appBarShift)}
      >
        <Toolbar className={classes.toolbar}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(
              classes.menuButton,
              open && classes.menuButtonHidden
            )}
          >
            <ChevronRightIcon />
          </IconButton>
          <Typography
            component="h1"
            variant="h4"
            color="inherit"
            noWrap
            className={classes.title}
          >
            Relier
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <List>
          <ListItem button>
            <ListItemIcon onClick={handleDrawerClose}>
              <ChevronLeftIcon />
            </ListItemIcon>
            {teamName ? (
              <ListItemText id="teamNameHeader" primary={teamName} />
            ) : (
              <></>
            )}
          </ListItem>
        </List>
        <Divider />
        <List
          style={{
            height: "calc(100vh-179px}",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <div>
            {channels.map((channel) => (
              <ListItem
                button
                id={channel.secret}
                onClick={(e) => {
                  clickChannel(e.currentTarget.id);
                }}
              >
                <ListItemIcon>
                  <Avatar variant="rounded" className={classes.orange}>
                    {channel.name.substring(0, 1)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary={channel.name} />
              </ListItem>
            ))}
          </div>
        </List>
        <List className={classes.bottomToolbar}>
          <Divider />
          <ListItem
            button
            style={{ paddingTop: 10 }}
            onClick={handleCreateOpen}
          >
            <ListItemIcon style={{ paddingLeft: 6 }}>
              <AddIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Add channels" />
          </ListItem>
          <ListItem button onClick={handleInviteOpen}>
            <ListItemIcon style={{ paddingLeft: 6 }}>
              <ShareIcon color="secondary" />
            </ListItemIcon>
            <ListItemText primary="Invite to Team" />
          </ListItem>
        </List>
      </Drawer>
      <main className={classes.content} id="main-container">
        <div className={classes.appBarSpacer} />
        <Container
          maxWidth="lg"
          className={classes.container}
          style={{ paddingBottom: 0 }}
        >
          <Grid container spacing={3} style={{ paddingBottom: 0 }}>
            <Grid item xs={12}>
              {messages.map((message) => (
                <Paper
                  id={message.id}
                  elevation={1}
                  style={{ padding: 12, marginBottom: 24 }}
                >
                  <Grid container spacing={3} style={{ overflow: true }}>
                    <Grid item xs={1} style={{ paddingBottom: 0 }}>
                      {message.is_vc ? (
                        <Videocam
                          style={{
                            height: 32,
                            width: 32,
                            margin: "auto",
                            paddingBottom: 0,
                          }}
                        />
                      ) : (
                        <Avatar
                          variant="rounded"
                          className={classes.orange}
                          style={{
                            height: 32,
                            width: 32,
                            margin: "auto",
                            paddingBottom: 0,
                          }}
                        >
                          {message.sender.name.substring(0, 1)}
                        </Avatar>
                      )}
                    </Grid>
                    <Grid
                      item
                      xs={5}
                      style={{ paddingLeft: 0, paddingBottom: 0 }}
                    >
                      {message.is_vc ? (
                        <Link
                          to={message.text}
                          style={{ textDecoration: "none" }}
                          target="_blank"
                        >
                          <Typography align="left" color="primary">
                            {"Join Call"}
                          </Typography>
                        </Link>
                      ) : (
                        <Typography align="left" color="primary">
                          {message.sender.name}
                        </Typography>
                      )}
                    </Grid>
                    <Grid item xs={6} style={{ paddingBottom: 0 }}>
                      <Typography align="right" color="textSecondary">
                        {message.timestamp.split(":")[0].slice(-2) +
                          ":" +
                          message.timestamp.split(":")[1]}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={11}
                      style={{
                        marginLeft: "auto",
                        paddingLeft: 0,
                        paddingTop: 0,
                      }}
                    >
                      {message.is_vc ? (
                        <Typography align="left">
                          {"Started by " + message.sender.name}
                        </Typography>
                      ) : (
                        <Typography align="left">{message.text}</Typography>
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
            <Grid
              item
              xs={12}
              style={{
                position: "sticky",
                bottom: 0,
                paddingBottom: 24,
                paddingTop: 24,
                backgroundColor: "#fafafa",
                width: 900,
              }}
            >
              <TextField
                id="outlined-textarea"
                label="Message"
                placeholder="Message"
                inputRef={message}
                type="text"
                multiline
                variant="outlined"
                fullWidth
                onKeyDown={handleKeyDown}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="send"
                        edge="end"
                        onClick={() => {
                          sendMessage(true);
                        }}
                      >
                        <VideoCall fontSize="large" />
                      </IconButton>
                      <IconButton
                        aria-label="send"
                        edge="end"
                        onClick={() => {
                          sendMessage();
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </main>
    </div>
  );
}
