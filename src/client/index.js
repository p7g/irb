import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { render } from 'react-dom';

import Main from './layouts/Main';
import Home from './pages/Home';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
    };
  }

  async componentDidMount() {
    // eslint-disable-next-line no-undef
    const res = await fetch('/api/v1/users/@me');

    let user = null;
    if (res.ok) {
      const { data } = await res.json();
      user = data;
    }

    this.setState({ user });
  }

  render() {
    const { user } = this.state;
    return (
      <BrowserRouter>
        <Main user={user}>
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <Home loggedIn={!!user} />
              )}
            />
            <Route render={() => <p>Not found</p>} />
          </Switch>
        </Main>
      </BrowserRouter>
    );
  }
}

// eslint-disable-next-line no-undef
render(<App />, document.getElementById('app'));
