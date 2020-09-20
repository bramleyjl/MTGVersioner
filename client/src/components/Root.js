import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";

import HomePage from "./HomePage";
import About from "./About";
import ImageSelect from "./ImageSelect";
import FinalizedImages from "./FinalizedImages";

class Root extends Component {
  constructor(props) {
    super(props);
    this.handleScript = this.handleScript.bind(this);
    this.handleVersion = this.handleVersion.bind(this);
    this.state = {
      submittedScript: "",
      indexedScript: "",
      versionSubmit: undefined,
    };
  }

  handleScript = (scriptValue) => {
    this.setState({ submittedScript: scriptValue });
  };

  handleVersion = (indexedScript, versionSubmit) => {
    this.setState({
      indexedScript: indexedScript,
      versionSubmit: versionSubmit,
    });
  };

  render() {
    return (
      <BrowserRouter>
        <div>
          <Route
            exact
            path="/"
            render={(props) => (
              <HomePage {...props} checkScript={this.handleScript} />
            )}
          />
          <Route exact path="/about" render={(props) => <About />} />
          <Route
            path="/imageSelect"
            render={(props) => (
              <ImageSelect
                {...props}
                script={this.state.submittedScript}
                handleImageSelect={this.handleVersion}
              />
            )}
          />
          <Route
            path="/finalizedImages"
            render={(props) => (
              <FinalizedImages
                {...props}
                indexedScript={this.state.indexedScript}
                versions={this.state.versionSubmit}
              />
            )}
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default Root;
