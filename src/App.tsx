import "./App.css";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Layout from "./layout/layout";
import Home from "./pages/home/home";
import Room from "./pages/room/room";
import {Provider} from "react-redux";
import {store} from "./utils/redux/store";
import StartGame from "./pages/start-game/start-game";
import TimeoutRoom from "./pages/timeout-room/timeout-room";
import Guarded from "./utils/HOCs/guarded";
import {useEffect} from "react";

const App = () => {
  useEffect(() => {
    const disableConsoleLogs = false;
    if (disableConsoleLogs) {
      console.log = () => {};
      console.error = () => {};
      console.warn = () => {};
      console.debug = () => {};
    }
  }, []);

  return (
    <BrowserRouter>
      <Provider store={store}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/start-game" element={<StartGame />} />
            <Route
              path="/room/:hostAddress/:contractAddress"
              element={
                <Guarded>
                  <Room />
                </Guarded>
              }
            />
            <Route
              path="/timeout/:hostAddress/:contractAddress"
              element={
                <Guarded>
                  <TimeoutRoom />
                </Guarded>
              }
            />
          </Route>
        </Routes>
      </Provider>
    </BrowserRouter>
  );
};

export default App;
