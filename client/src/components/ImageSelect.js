import React, { Component } from "react";

import Grid from "@material-ui/core/Grid";
import SelectCardGroup from "./SelectCardGroup";
import NavBar from "./NavBar";
import Loading from "./Loading";

class ImageSelect extends Component {
  constructor(props) {
    super(props);
    this.versionSelect = this.versionSelect.bind(this);
    this.finalizeVersions = this.finalizeVersions.bind(this);
    this.state = {
      loading: true,
      indexedScript: "",
      cardImages: {},
      selectButton: false,
      selectedVersions: {}
    };
  }

  componentDidMount() {
    this.getProps();
  }

  getProps() {
    let script = this.props.script;
    if (script !== "") {
      localStorage.setItem("script", script);
      this.downloadPreviews(script);
    } else {
      const cachedScript = localStorage.getItem("script");
      this.downloadPreviews(cachedScript);
    }
  }

  downloadPreviews = async (script, annotate) => {
    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        script: script
      })
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/imageSelect",
      config
    );
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    if (body.userAlert !== "") {
      window.alert(body.userAlert);
    }
    this.setState({
      indexedScript: body.indexedScript,
      cardImages: body.cardImages,
      selectButton: true,
      loading: false
    });
    return body;
  };

  versionSelect(index, version) {
    this.setState({
      selectedVersions: { ...this.state.selectedVersions, [index]: version }
    });
  }

  finalizeVersions(event) {
    event.preventDefault();
    var versionSubmit = [];
    const cardObjects = Object.values(this.state.cardImages);
    const selectedVersions = this.state.selectedVersions;
    var i = 0;
    cardObjects.forEach(function(card) {
      if (!(i in selectedVersions)) {
        var versions = Object.values(card)[0];
        for (var version in versions) {
          var autoSelected = {};
          autoSelected[version] = versions[version];
          autoSelected['count'] = card['count'];
          versionSubmit[i] = autoSelected;
          break;
        }
      } else {
        selectedVersions[i]['count'] = card['count'];
        versionSubmit[i] = selectedVersions[i];
      }
      i ++;
    });
    this.props.handleImageSelect(this.state.indexedScript, versionSubmit);
    this.props.history.push("/imageDownload");
  }

  render() {
    return (
      <div>
        <NavBar selectButton={this.state.selectButton} />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">Version Select</h1>
          </Grid>

          {this.state.loading ? (
            <Loading loading={this.state.loading} />
          ) : (
            <form
              id="versionSelect"
              onSubmit={this.finalizeVersions.bind(this)}
            >
              <Grid item xs={12}>
                <div className="scriptDisplay">
                  <input
                    type="hidden"
                    name="script"
                    value={this.state.indexedScript}
                  />
                  <h3>Entered Script:</h3>
                  <p id="baseScript">{this.state.indexedScript}</p>
                </div>
              </Grid>

              <Grid item xs={12}>
                <ol>
                  {Object.keys(this.state.cardImages).map(key => (
                    <SelectCardGroup
                      key={key}
                      index={key}
                      versionSelect={this.versionSelect}
                      details={this.state.cardImages[key]}
                    />
                  ))}
                </ol>
              </Grid>
            </form>
          )}
        </Grid>
      </div>
    );
  }
}

export default ImageSelect;
