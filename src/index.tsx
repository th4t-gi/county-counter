import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { FirebaseAppProvider } from 'reactfire'
import { firebaseConfig } from './firebase';


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    {/* <Provider store={store}> */}
    <FirebaseAppProvider firebaseConfig={firebaseConfig}>
      <App />
    </FirebaseAppProvider>
    {/* </Provider> */}
  </React.StrictMode>
);
