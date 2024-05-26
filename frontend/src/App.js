/* -------------------------------------------------------------
 * Project: IDG2001 Cloud Technologies - assignment 2
 * File: App.js
 * Brief: Web application implementation
 * Author: Tomas Hladky <tomashl@stud.ntnu.no>
 * Date: May 24th, 2024
 * -------------------------------------------------------------
 */

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toast } from 'bootstrap';
import ErrorIcon from './assets/error.svg';
import Home from './Components/Home';
import Category from './Components/Category';
import ApiService from './ApiService';
import './App.scss';
import { API_URL, API_PORT, CACHE_URL, CACHE_PORT, CACHE_ENABLED } from './env';
import { LOGGED_IN_UNKNOWN, LOGGED_IN_TRUE, LOGGED_IN_FALSE } from './types';
import Login from './Components/Login';
import Register from './Components/Register';
import Logout from './Components/Logout';
import User from './Components/User';

const ALERT_SHOW_TIME = 8000;

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            alertTitle: 'Oops, this should not happen',
            alertContent: 'Error while communicating with server.',

            categories: [],
            loggedIn: LOGGED_IN_UNKNOWN,
        };

        this.mainComponentMounted = false;

        this.toastAlertRef = React.createRef();
        this.toastTimeout = null;

        this.callLogout = this.callLogout.bind(this);
        this.showAlert = this.showAlert.bind(this);
        this.hideAlert = this.hideAlert.bind(this);

        this.api = ApiService.getInstance();
        this.api.setBaseUrl(API_URL);
        this.api.setPort(API_PORT);
        this.api.setCacheUrl(CACHE_URL);
        this.api.setCachePort(CACHE_PORT);
        this.api.setCacheEnabled(CACHE_ENABLED);
    }

    async componentDidMount() {
        if (!this.mainComponentMounted) {
            this.mainComponentMounted = true;

            this.toastAlert = new Toast(this.toastAlertRef.current, {
                delay: ALERT_SHOW_TIME,
            });

            const loggedUsername = localStorage.getItem('username');

            if (loggedUsername !== null) {
                const refreshTokenResponse = await this.api.refreshToken();
                if (refreshTokenResponse.success) {
                    this.setState({
                        loggedIn: LOGGED_IN_TRUE,
                    });
                } else {
                    await this.api.logout();
                    localStorage.removeItem('username');
                    localStorage.removeItem('user_id');
                    this.showAlert(refreshTokenResponse.errorMessage);
                    this.setState({
                        loggedIn: LOGGED_IN_FALSE,
                    });
                }
            } else {
                this.setState({
                    loggedIn: LOGGED_IN_FALSE,
                });
            }

            const response = await this.api.getCategories();
            if (!response.success) {
                this.showAlert(response.errorMessage);
            } else {
                this.setState({
                    categories: response.data,
                });
            }
        }
    }

    showAlert(alertTitle = 'Oops, this should not happen', alertContent = 'Error while communicating with server.') {
        this.setState(
            {
                alertTitle: alertTitle,
                alertContent: alertContent,
            },
            () => {
                if (this.toastTimeout !== null) {
                    clearTimeout(this.toastTimeout);
                }
                this.toastAlert.show();
                this.toastTimeout = setTimeout(() => {
                    this.toastAlert.hide();
                }, ALERT_SHOW_TIME);
            },
        );
    }

    hideAlert() {
        clearTimeout(this.toastTimeout);
        this.toastTimeout = null;
        this.toastAlert.hide();
    }

    callLogout() {
        this.setState({
            loggedIn: LOGGED_IN_FALSE
        });
    }

    renderAlertToast() {
        return (
            <div className={'position-fixed top-0 end-0 p-3'} style={{ zIndex: 2000 }}>
                <div ref={this.toastAlertRef} className={'toast hide'} role={'alert'}>
                    <div className={'toast-header'}>
                        <img className={'me-1'} src={ErrorIcon} alt={'error'} />
                        <strong className={'me-auto'}>{this.state.alertTitle}</strong>
                        <button type={'button'} className={'btn-close'} onClick={this.hideAlert}></button>
                    </div>
                    <div className={'toast-body'}>{this.state.alertContent}</div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <>
                {this.renderAlertToast()}
                <header className={'navbar navbar-expand-lg sticky-top'}>
                    <div className={'container'}>
                        <a className={'navbar-brand d-flex flex-row'} href={'/'}>
                            <h3 className={'ms-3 mb-0 title'}>Reddit-like web</h3>
                        </a>
                        <button
                            className={'navbar-toggler'}
                            type={'button'}
                            data-bs-toggle={'collapse'}
                            data-bs-target={'#navbarNav'}
                            aria-controls={'navbarNav'}
                            aria-expanded={'false'}
                            aria-label={'Toggle navigation'}
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0 w-100">
                                {this.state.categories.map((category) => (
                                    <a href={`/category/${category.id}`} key={category.id}>
                                        <li className="nav-item px-2">{category.name}</li>
                                    </a>
                                ))}
                                {this.state.loggedIn === LOGGED_IN_UNKNOWN ? (
                                    <></>
                                ) : this.state.loggedIn === LOGGED_IN_TRUE ? (
                                    <>
                                        <a
                                            className="ms-auto pt-2 px-2 py-md-0"
                                            href={`/user/${localStorage.getItem('username')}`}
                                        >
                                            My Profile
                                        </a>
                                        <a className="pt-2 px-2 py-md-0" href="/logout">
                                            Logout
                                        </a>
                                    </>
                                ) : (
                                    <>
                                        <a className="ms-auto pt-2 px-2 py-md-0" href="/register">
                                            Register
                                        </a>
                                        <a className="pt-2 px-2 py-md-0" href="/login">
                                            Login
                                        </a>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </header>
                <div className="container center text-center my-5">
                    <BrowserRouter>
                        <Routes>
                            <Route
                                index
                                exact
                                path={'/'}
                                element={<Home loggedIn={this.state.loggedIn} showAlert={this.showAlert} />}
                            ></Route>
                            <Route
                                exact
                                path={'/category/:category_id'}
                                element={<Category loggedIn={this.state.loggedIn} showAlert={this.showAlert} />}
                            ></Route>
                            <Route
                                exact
                                path={'/login'}
                                element={<Login loggedIn={this.state.loggedIn} showAlert={this.showAlert} />}
                            ></Route>
                            <Route
                                exact
                                path={'/register'}
                                element={<Register loggedIn={this.state.loggedIn} showAlert={this.showAlert} />}
                            ></Route>
                            <Route exact path={'/logout'} element={<Logout callLogout={this.callLogout} showAlert={this.showAlert} />}></Route>
                            <Route exact path={'/user/:username'} element={<User showAlert={this.showAlert} />}></Route>
                        </Routes>
                    </BrowserRouter>
                </div>
                <footer className="mb-3 text-center">Tomas Hladky, part of the course IDG2001 at NTNU at 2024</footer>
            </>
        );
    }
}
