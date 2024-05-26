import React from 'react';
import { LOGGED_IN_TRUE, LOGGED_IN_UNKNOWN } from '../types';
import ApiService from './../ApiService';

export default class Home extends React.Component {
    constructor(props) {
        super(props);

        this.api = ApiService.getInstance();
    }

    render() {
        return (
            <div className="container-xl">
                {this.props.loggedIn === LOGGED_IN_UNKNOWN ? (
                    <></>
                ) : this.props.loggedIn === LOGGED_IN_TRUE ? (
                    <>
                        <h2>{`Welcome back ${localStorage.getItem('username')}`}</h2>
                        <p>Please select a category</p>
                    </>
                ) : (
                    <>
                        <p>Please select a category</p>
                        <p>or</p>
                        <div className="display-flex flex-row">
                            <a href="/register" className="btn btn-primary mx-2">
                                Register
                            </a>
                            <a href="/login" className="btn btn-primary mx-2">
                                Login
                            </a>
                        </div>
                    </>
                )}
            </div>
        );
    }
}
