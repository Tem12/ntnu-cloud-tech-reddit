import { Modal } from 'bootstrap';
import Category from './Category';

export default class User extends Category {
    constructor(props) {
        super(props);

        this.state = {
            categoryName: '...',
            currentPage: 0,
            postCount: 0,
            posts: [],
            postLikes: {},

            newPostText: '',
            newPostError: false,
            errorMessage: '',

            username: '',
            email: '',
            createdAt: '',

            isTheLoggedUser: false,

            changeUsernameText: '',
            changeUsernameError: false,
            changeEmailText: '',
            changeEmailError: false,
            changePasswordText: '',
            changePasswordError: false,
        };

        this.handleUsernameText = this.handleUsernameText.bind(this);
        this.handleEmailText = this.handleEmailText.bind(this);
        this.handlePasswordText = this.handlePasswordText.bind(this);
        this.submitChangeUsername = this.submitChangeUsername.bind(this);
        this.submitChangeEmail = this.submitChangeEmail.bind(this);
        this.submitChangePassword = this.submitChangePassword.bind(this);
        this.submitDeleteUser = this.submitDeleteUser.bind(this);
    }

    async componentDidMount() {
        // Get user info
        this.usernamePage = window.location.pathname.split('/').pop();

        this.changeUsernameModal = new Modal(document.getElementById('changeUsernameModal'));
        this.changeEmailModal = new Modal(document.getElementById('changeEmailModal'));
        this.changePasswordModal = new Modal(document.getElementById('changePasswordModal'));
        this.deleteAccountModal = new Modal(document.getElementById('confirmDeleteAccountModal'));

        const response = await this.api.getUserInfo(this.usernamePage);
        if (!response.success) {
            // Invalid user id
            window.location.href = '/';
        } else {
            this.userId = response.data.id;

            if (typeof response.data.email === 'undefined' || response.data.email === null) {
                // User is not logged in as the user on profile page
                this.setState({
                    isTheLoggedUser: false,
                    username: this.usernamePage,
                    createdAt: new Date(response.data.created_at).toLocaleString(),
                });
            } else {
                // User is logged in as the user on profile page
                this.setState({
                    isTheLoggedUser: true,
                    username: this.usernamePage,
                    email: response.data.email,
                    createdAt: new Date(response.data.created_at).toLocaleString(),
                });
            }
        }

        await this.getPostData();
    }

    async getPostData() {
        const numberOfPostsResponse = await this.api.getNumberOfPostsOfUser(this.userId);

        if (!numberOfPostsResponse.success) {
            this.props.showAlert(numberOfPostsResponse.errorMessage);
        } else {
            this.setState({
                postCount: numberOfPostsResponse.data.posts_count,
            });
        }

        const response = await this.api.getPostsOfUser(this.userId, this.state.currentPage * this.PAGE_SIZE);

        if (!response.success) {
            this.props.showAlert(response.errorMessage);
        } else {
            this.setState({
                posts: response.data,
            });
        }

        // Request likes of posts if cache is enabled
        if (this.api.isCacheEnabled()) {
            const ids = [];
            const postObjs = response.data;
            for (let singleObj of postObjs) {
                ids.push(singleObj.id);
            }

            const likesResponse = await this.api.getPostsLikes(ids);

            if (likesResponse.success) {
                this.setState({
                    postLikes: likesResponse.data.likes,
                });
            }
        }
    }

    async onLikeClicked(post_id) {
        const posts = this.state.posts;
        for (let post of posts) {
            if (post.id === post_id) {
                post.likes++;
                break;
            }
        }

        const postLikes = this.state.postLikes;
        if (this.api.isCacheEnabled()) {
            postLikes[post_id]++;
        }

        this.setState({
            posts: posts,
            postLikes: postLikes,
        });

        // Send request to cache service if enabled
        const response = await this.api.likePost(post_id);
        if (!response.success) {
            this.props.showAlert(response.errorMessage);
        }
    }

    handleUsernameText(event) {
        this.setState({
            changeUsernameText: event.target.value,
            changeUsernameError: event.target.value.length === 0,
        });
    }

    handleEmailText(event) {
        this.setState({
            changeEmailText: event.target.value,
            changeEmailError: event.target.value.length === 0,
        });
    }

    handlePasswordText(event) {
        this.setState({
            changePasswordText: event.target.value,
            changePasswordError: event.target.value.length === 0,
        });
    }

    async submitChangeUsername() {
        const response = await this.api.changeUsername(this.userId, this.state.changeUsernameText);

        if (!response.success) {
            this.setState({
                errorMessage: response.validError ? response.errorMessage : '',
                changeUsernameError: false,
            });
        } else {
            this.changeUsernameModal.hide();
            const newUsername = this.state.changeUsernameText;
            this.setState({
                errorMessage: '',
                changeUsernameError: false,
                changeUsernameText: '',
                username: newUsername,
            });

            localStorage.setItem('username', newUsername);
            window.location.pathname = `/user/${newUsername}`;
        }
    }

    async submitChangeEmail() {
        const response = await this.api.changeEmail(this.userId, this.state.changeEmailText);

        if (!response.success) {
            this.setState({
                errorMessage: response.validError ? response.errorMessage : '',
                changeEmailError: false,
            });
        } else {
            this.changeEmailModal.hide();
            const newEmail = this.state.changeEmailText;
            this.setState({
                errorMessage: '',
                changeEmailError: false,
                changeEmailText: '',
                email: newEmail,
            });
        }
    }

    async submitChangePassword() {
        const response = await this.api.changePassword(this.userId, this.state.changePasswordText);

        if (!response.success) {
            this.setState({
                errorMessage: response.validError ? response.errorMessage : '',
                changePasswordError: false,
            });
        } else {
            this.changePasswordModal.hide();
            this.setState({
                errorMessage: '',
                changePasswordError: false,
                changePasswordText: '',
            });
        }
    }

    async submitDeleteUser() {
        const response = await this.api.deleteAccount(this.userId);

        if (!response.success) {
            this.props.showAlert(response.errorMessage);
        } else {
            this.deleteAccountModal.hide();
            window.location.href = '/logout';
        }
    }

    renderUserManagement() {
        if (!this.state.isTheLoggedUser) {
            return null;
        } else {
            return (
                <div>
                    <hr />
                    <h6>User settings: (only you can see this section)</h6>
                    <p>{`Email: ${this.state.email}`}</p>
                    <div className="d-flex flex-column">
                        <button className="btn btn-primary mx-auto user-edit-btn" data-bs-toggle="modal" data-bs-target="#changeUsernameModal">Change username</button>
                        <button className="btn btn-primary mx-auto mt-2 user-edit-btn" data-bs-toggle="modal" data-bs-target="#changeEmailModal">Change email</button>
                        <button className="btn btn-primary mx-auto mt-2 user-edit-btn" data-bs-toggle="modal" data-bs-target="#changePasswordModal">Change password</button>
                        <button className="btn btn-danger mx-auto mt-2 user-edit-btn" data-bs-toggle="modal" data-bs-target="#confirmDeleteAccountModal">Delete account</button>
                    </div>
                </div>
            );
        }
    }

    renderChangeUsernameModal() {
        return (
            <div
                className="modal fade"
                id="changeUsernameModal"
                tabIndex="-1"
                aria-labelledby="changeUsernameModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="changeUsernameModalLabel">
                                Change username
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                className={'mb-3 form-control' + (this.state.changeUsernameError ? ' is-invalid' : '')}
                                type={'text'}
                                placeholder={'New username...'}
                                value={this.state.changeUsernameText}
                                onChange={this.handleUsernameText}
                            />
                            <p className="error-message">{this.state.errorMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={this.submitChangeUsername}>
                                Confirm change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderChangeEmailModal() {
        return (
            <div
                className="modal fade"
                id="changeEmailModal"
                tabIndex="-1"
                aria-labelledby="changeEmailModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="changeEmailModalLabel">
                                Change email
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                className={'mb-3 form-control' + (this.state.changeEmailError ? ' is-invalid' : '')}
                                type={'text'}
                                placeholder={'New email...'}
                                value={this.state.changeEmailText}
                                onChange={this.handleEmailText}
                            />
                            <p className="error-message">{this.state.errorMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={this.submitChangeEmail}>
                                Confirm change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderChangePasswordModal() {
        return (
            <div
                className="modal fade"
                id="changePasswordModal"
                tabIndex="-1"
                aria-labelledby="changePasswordModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="changePasswordModalLabel">
                                Change password
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <input
                                className={'mb-3 form-control' + (this.state.changePasswordError ? ' is-invalid' : '')}
                                type={'password'}
                                placeholder={'New password...'}
                                value={this.state.changePasswordText}
                                onChange={this.handlePasswordText}
                            />
                            <p className="error-message">{this.state.errorMessage}</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={this.submitChangePassword}>
                                Confirm change
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderConfirmDeleteAccountModal() {
        return (
            <div
                className="modal fade"
                id="confirmDeleteAccountModal"
                tabIndex="-1"
                aria-labelledby="confirmDeleteAccountModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="confirmDeleteAccountModalLabel">
                                Delete account
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <p className="error-message">Warning: This action cannot be undone</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-danger" onClick={this.submitDeleteUser}>
                                Delete account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="container-xl">
                <h2>{this.state.username}</h2>
                <p>{`Account created at: ${this.state.createdAt}`}</p>
                {this.renderUserManagement()}
                {this.renderChangeUsernameModal()}
                {this.renderChangeEmailModal()}
                {this.renderChangePasswordModal()}
                {this.renderConfirmDeleteAccountModal()}
                <hr />
                <h5>{`${this.state.username}'s posts:`}</h5>
                {this.renderPostPageControl()}
                <div className="d-flex flex-column">
                    {this.state.posts.map((post) => (
                        <div key={post.id} className="event-card mt-4 px-4 pt-3 pb-2">
                            <div className="row">
                                <div className="col-lg-10">
                                    <h3>{post.text}</h3>
                                </div>
                                <div className="col-lg-2">
                                    <p className="">{new Date(post.created_at).toLocaleString()}</p>
                                    <div className="d-block">
                                        <button
                                            className="thumb-up-button d-flex flex-row"
                                            onClick={() => this.onLikeClicked(post.id)}
                                        >
                                            <ion-icon class="mt-1 ms-2 px-1 py-2" name="thumbs-up-sharp"></ion-icon>
                                            <p className="likes-text mb-0 px-2 py-2">{this.getLikeValue(post)}</p>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
}
