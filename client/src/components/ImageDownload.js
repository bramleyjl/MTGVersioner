import React, { Component } from "react";

import FinalizeCardGroup from "./FinalizeCardGroup";
import Grid from "@material-ui/core/Grid";
import NavBar from "./NavBar";
import Loading from "./Loading";

class ImageDownload extends Component {
  constructor(props) {
    super(props);
    this.returnToImageSelect = this.returnToImageSelect.bind(this);
    this.downloadImages = this.downloadImages.bind(this);
    this.state = {
      loading: true,
      indexedScript: "",
      selectedVersions: {},
      downloadButton: false,
      downloadLink: ""
    };
  }

  componentDidMount() {
    this.getProps();
  }

  getProps() {
    let indexedScript = this.props.indexedScript;
    let versions = this.props.versions;
    if (indexedScript && versions) {
      localStorage.setItem("indexedScript", indexedScript);
      localStorage.setItem("versions", JSON.stringify(versions));
    } else {
      indexedScript = localStorage.getItem("indexedScript");
      versions = JSON.parse(localStorage.getItem("versions"));
    }
    this.setState({
      indexedScript: indexedScript,
      selectedVersions: versions,
      loading: false
    });
    //this.getFinalizedImages(indexedScript, versions);
  }

  getFinalizedImages = async (script, versions) => {
    const config = {
      method: "POST",
      headers: new Headers({
        Accept: "application/json",
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        script: script,
        versions: versions
      })
    };
    const response = await fetch(
      process.env.REACT_APP_URL + "/api/getFinalizedImages",
      config
    );
    const body = await response.json();
    this.setState({
      downloadLink: body.downloadLink,
      downloadButton: true,
      loading: false
    });
  };

  downloadImages = async event => {
    event.preventDefault();
    const config = {
      method: "GET",
      headers: new Headers({
        Accept: "application/zip",
        "Content-Type": "application/zip"
      })
    };
    fetch(
      process.env.REACT_APP_URL + "/api/download/" + this.state.downloadLink,
      config
    );
  };

  returnToImageSelect(event) {  
    event.preventDefault();
    this.props.history.push("/imageSelect");
  }

  render() {
    return (
      <div>
        <NavBar
          downloadButton={this.state.downloadButton}
          link={this.state.downloadLink}
        />
        <Grid container>
          <Grid item xs={12}>
            <h1 className="pageTitle">Image Download</h1>
          </Grid>

          {this.state.loading ? (
            <Loading />
          ) : (
            <div>
              <Grid item xs={12}>
                <div className="scriptDisplay">
                  <input
                    type="hidden"
                    name="script"
                    value={this.state.indexedScript}
                  />
                  <h4>Entered Script:</h4>
                  <p id="baseScript">{this.state.indexedScript}</p>
                </div>
              </Grid>

              <Grid item xs={10}>
                <ol className="downloadList">
                  {Object.keys(this.state.selectedVersions).map(key => (
                    <FinalizeCardGroup
                      key={key}
                      index={key}
                      versionSelect={undefined}
                      details={this.state.selectedVersions[key]}
                    />
                  ))}
                </ol>
              </Grid>
            </div>
          )}
        </Grid>
      </div>
    );
  }
}

export default ImageDownload;
