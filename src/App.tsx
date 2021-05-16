import React, { useEffect } from "react";
import tokens from '@contentful/forma-36-tokens';
import styled from "styled-components";
import {Button, Heading, SectionHeading} from "@contentful/forma-36-react-components";

const Container = styled.div`
  min-width: 200px;
  padding: ${tokens.spacingL};
`

function App() {

  useEffect(() => {
    chrome.storage.sync.set({ color: 1123 });
  }, [])

  const onActivationChange = (e: any) => {
    chrome.storage.sync.set({ debuggerStatus: e.target.value });
  }

  return (
    <Container>
      <h2>Debugger Activated:</h2>
      <input onChange={onActivationChange} type="radio" id="debugger-activated" name="activation" value="on" />
      <label htmlFor="contactChoice1">On</label>
      <input onChange={onActivationChange} type="radio" id="debugger-deactivated" name="activation" value="off" />
      <label htmlFor="contactChoice1">Off</label>

    </Container>
  );
}

export default App;
