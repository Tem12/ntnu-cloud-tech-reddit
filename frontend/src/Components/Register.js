import React from 'react';
import ApiService from '../ApiService';
import { LOGGED_IN_TRUE } from '../types';

export default class Register extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            username: '',
            usernameError: false,
            email: '',
            emailError: false,
            password: '',
            passwordError: false,
            error: false,
            errorMessage: '',
            loadingRequest: false,
        };

        this.api = ApiService.getInstance();

        this.handleUsernameChange = this.handleUsernameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handlePasswordChange = this.handlePasswordChange.bind(this);
        this.submitRegister = this.submitRegister.bind(this);

        // Prevention from submiting login form multiple times
        this.registerButtonClicked = false;

        if (props.loggedIn === LOGGED_IN_TRUE) {
            window.location.href = '/';
        }
    }

    handleUsernameChange(event) {
        this.setState({
            username: event.target.value,
            usernameError: event.target.value.length === 0,
        });
    }

    handleEmailChange(event) {
        this.setState({
            email: event.target.value,
            emailError: event.target.value.length === 0,
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
            passwordError: event.target.value.length === 0,
        });
    }

    handlePasswordChange(event) {
        this.setState({
            password: event.target.value,
            passwordError: event.target.value.length === 0,
        });
    }

    async submitRegister() {
        if (!this.registerButtonClicked) {
            this.setState({ loadingRequest: true, error: false, errorMessage: '' }, async () => {
                const username_sent = this.state.username;
                const response = await this.api.register(username_sent, this.state.email, this.state.password);

                if (response.success) {
                    localStorage.setItem('username', username_sent);
                    localStorage.setItem('user_id', response.data.user_id);
                    this.setState(
                        {
                            loadingRequest: false,
                            error: false,
                        },
                        () => (this.registerButtonClicked = false),
                    );
                    window.location.href = '/';
                } else {
                    if (response.validError) {
                        console.log(response.errorMessage);
                        this.setState(
                            {
                                loadingRequest: false,
                                error: true,
                                errorMessage: response.errorMessage,
                            },
                            () => (this.registerButtonClicked = false),
                        );
                    } else {
                        this.props.showAlert();
                        this.setState(
                            {
                                loadingRequest: false,
                            },
                            () => (this.registerButtonClicked = false),
                        );
                    }
                }
            });
        }
    }

    render() {
        return (
            <div className={'form-wrapper d-flex justify-content-center align-items-center'}>
                <form onSubmit={(event) => event.preventDefault()}>
                    <div className={'p-4 form-container'}>
                        <h3>Register</h3>
                        <hr />
                        <div className={'mx-3 mb-3 px-4 d-flex flex-column'}>
                            <label>Username</label>
                            <input
                                className={'mb-3 form-control' + (this.state.usernameError ? ' is-invalid' : '')}
                                type={'text'}
                                placeholder={'Username'}
                                value={this.state.username}
                                onChange={this.handleUsernameChange}
                            />
                            <label>Email</label>
                            <input
                                className={'mb-3 form-control' + (this.state.emailError ? ' is-invalid' : '')}
                                type={'text'}
                                placeholder={'Email'}
                                value={this.state.email}
                                onChange={this.handleEmailChange}
                            />
                            <label>Password</label>
                            <input
                                className={'mb-3 form-control' + (this.state.passwordError ? ' is-invalid' : '')}
                                type={'password'}
                                placeholder={'Password'}
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                            />
                            <p className={'error-message mb-2' + (!this.state.error ? ' d-none' : '')}>
                                {this.state.errorMessage}
                            </p>
                            <button
                                className={'btn btn-primary my-3'}
                                onClick={this.submitRegister}
                                disabled={this.state.loadingRequest}
                            >
                                {this.state.loadingRequest ? (
                                    <span
                                        className={'spinner-border spinner-border-sm align-middle me-2'}
                                        role={'status'}
                                        aria-hidden={'true'}
                                    ></span>
                                ) : null}
                                Register
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}
