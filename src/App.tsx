import React, {useEffect, useState} from "react";
import tokens from '@contentful/forma-36-tokens';
import styled from "styled-components";
import {Button, Heading, SectionHeading} from "@contentful/forma-36-react-components";

const Container = styled.div`
  min-width: 200px;
  padding: ${tokens.spacingL};
`

function App() {
  const [status, setStatus] = useState(null)

  const onActivationChange = (e: any) => {
    chrome.storage.sync.set({ debuggerStatus: e.target.value });
  }

  useEffect(() => {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
      setStatus(changes.debuggerStatus.newValue)
    });
  }, [])

  chrome.storage.sync.get(['debuggerStatus'], function(result) {
    console.log(result)
  });

  useEffect(() => {
    chrome.storage.sync.get(['debuggerStatus'], function(result) {
      console.log(result)
      setStatus(result.debuggerStatus)
    });
  }, [])


  return (
    <Container>
      <h2>Debugger Activated:</h2>
      <input onChange={onActivationChange} type="radio" id="debugger-activated" name="activation" value="on" checked={status === 'on'} />
      <label htmlFor="contactChoice1">On</label>
      <input onChange={onActivationChange} type="radio" id="debugger-deactivated" name="activation" value="off" checked={status === 'off'} />
      <label htmlFor="contactChoice1">Off</label>
    </Container>
  );
}

export default App;
