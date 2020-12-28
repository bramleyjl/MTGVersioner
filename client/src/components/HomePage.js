import React, { Component } from "react";
import Grid from "@material-ui/core/Grid";
import { getCachedData, setCachedData, sortVersions } from "../helpers/helper.js";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Fab from "@material-ui/core/Fab";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Zoom from "@material-ui/core/Zoom";

import NavBar from "./navBar/NavBar";
import CardList from "./cardList/CardList";
import CardPlaceholders from './CardPlaceholders';
import VersionSelect from "./VersionSelect";

const useStyles = makeStyles(theme => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2)
  }
}));

function ScrollTop(props) {
  const { children } = props;
  const classes = useStyles();
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100
  });

  const handleClick = event => {
    const anchor = document.querySelector("#back-to-top-anchor");
    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        {children}
      </div>
    </Zoom>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired
};

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.clearList = this.clearList.bind(this);
    this.versionLookup = this.versionLookup.bind(this);
    this.state = {
      cardList: getCachedData("cardList"),
      cardImages: [],
      cardPlaceHolders: true,
      finalButtons: false,
      loading: true
    };
  }

  componentDidMount() {
    if (this.state.cardList) {
      this.setState({ cardPlaceHolders: false });
      this.fetchPreviews(this.state.cardList);
    }
  } 

  clearList() {
    this.setState({
      cardList: '',
      cardImages: [],
      cardPlaceHolders: true,
      finalButtons: false
    });
    setCachedData('cardList', '');
  }

  fetchPreviews = async (cardList) => {
    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        cardList: cardList,
      }),
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/VersionSelect",
      config
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    if (body.userAlert !== "") {
      window.alert(body.userAlert);
    }
    let sortedImages = sortVersions(body.cardImages, 'versionName');
    this.setState({
      cardList: cardList,
      cardImages: sortedImages,
      finalButtons: true,
      loading: false,
    });
  };

  versionLookup = (cardList) => {
    this.setState({
      cardList: cardList,
      cardImages: [],
      finalButtons: false,
      cardPlaceHolders: false,
      loading: true
    });
    setCachedData('cardList', cardList);
    this.fetchPreviews(cardList);
  };

  render() {
    return (
      <div>
        <NavBar
          finalButtons={this.state.finalButtons}
          cardImages={this.state.cardImages}
        />
        <div id="back-to-top-anchor"></div>
        <Grid
          container
          justify="space-around"
        >
          <Grid item xs={2}>
            <CardList
              cardList={this.state.cardList}
              clearList={this.clearList}
              versionLookup={this.versionLookup}
            />
          </Grid>
          <Grid item xs={9}>
            {this.state.cardPlaceHolders ?
              <CardPlaceholders /> :
              <VersionSelect 
                cardImages={this.state.cardImages}
                loading={this.state.loading}
                handleVersionSelect={this.handleVersionSelect}
              />
            }
          </Grid>
          <ScrollTop>
            <Fab color="secondary" size="small" aria-label="scroll back to top">
              <KeyboardArrowUpIcon />
            </Fab>
          </ScrollTop>
        </Grid>
      </div>
    );
  }
}

export default HomePage;
