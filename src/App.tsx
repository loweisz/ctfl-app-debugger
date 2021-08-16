import React, {useEffect, useState} from "react";
import tokens from '@contentful/forma-36-tokens';
import styled from "styled-components";

const Container = styled.div<{ activated: boolean }>`
  min-width: 200px;
  padding: ${tokens.spacingL};
  background: ${({ activated }) => activated ? tokens.colorGreenBase :tokens.colorRedBase};
  border-radius: 12px;
  color: white;
`

const Button = styled.button`
  min-width: 200px;
  padding: ${tokens.spacingM};
  background: white;
  border-radius: 12px;
  font-size: 16px;
  box-shadow: 4px 4px #000000;
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
    <Container activated={status === 'on'}>
      <h2>Contentful App Debugger</h2>
      <Button onClick={onActivationChange}>{status === 'on' ? 'Deactivate' : 'Activate'}</Button>
    </Container>
  );
}

export default App;
