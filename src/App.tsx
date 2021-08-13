import React, {useEffect, useState} from "react";
import tokens from '@contentful/forma-36-tokens';
import styled from "styled-components";

const Container = styled.div`
  min-width: 200px;
  padding: ${tokens.spacingL};
`

function App() {
  const [status, setStatus] = useState<string>("off")

  const onActivationChange = () => {
    const newVal = status === "off" ? "on" : "off";
    setStatus(newVal)
    chrome.storage.sync.set({ debuggerStatus: newVal });
  }

  // useEffect(() => {
  //   chrome.storage.onChanged.addListener(function (changes, namespace) {
  //     setStatus(changes.debuggerStatus.newValue)
  //   });
  // }, [])
  //
  useEffect(() => {
   chrome.storage.sync.get(['debuggerStatus'], function(result) {
       console.log(result)
       setStatus(result.debuggerStatus)
     });
   }, [])


  return (
    <Container>
      <h2>Debugger Activated:</h2>
      <button onClick={onActivationChange}>{status === 'on' ? 'Deactivate' : 'Activate'}</button>


    </Container>
  );
}

export default App;
