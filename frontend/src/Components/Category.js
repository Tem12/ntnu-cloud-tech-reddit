import React from 'react';
import ApiService from './../ApiService';
import { Modal } from 'bootstrap';

import './Category.scss';
import { LOGGED_IN_TRUE, LOGGED_IN_UNKNOWN } from '../types';

export default class Category extends React.Component {
    constructor(props) {
        super(props);

        this.PAGE_SIZE = 10;

        this.state = {
            categoryName: '...',
            currentPage: 0,
            postCount: 0,
            posts: [],
            postLikes: {},

            newPostText: '',
            newPostError: false,
            errorMessage: '',
        };

        this.api = ApiService.getInstance();

        this.createPostSubmitClick = false;

        this.handlePreviousPage = this.handlePreviousPage.bind(this);
        this.handleNextPage = this.handleNextPage.bind(this);
        this.onLikeClicked = this.onLikeClicked.bind(this);
        this.getLikeValue = this.getLikeValue.bind(this);
        this.handleNewPostText = this.handleNewPostText.bind(this);
        this.submitNewPost = this.submitNewPost.bind(this);
    }

    async componentDidMount() {
        this.categoryId = window.location.pathname.split('/').pop();
        this.createPostModal = new Modal(document.getElementById('createPostModal'));

        await this.getPostData();
    }

    async getPostData() {
        const numberOfPostsResponse = await this.api.getNumberOfPostsInCategory(this.categoryId);

        if (!numberOfPostsResponse.success) {
            this.props.showAlert(numberOfPostsResponse.errorMessage);
        } else {
            this.setState({
                postCount: numberOfPostsResponse.data.posts_count,
            });
        }

        const categoryNameResponse = await this.api.getCategoryName(this.categoryId);

        if (!categoryNameResponse.success) {
            this.props.showAlert(categoryNameResponse.errorMessage);
        } else {
            this.setState({
                categoryName: categoryNameResponse.data.name,
            });
        }

        const response = await this.api.getPostsInCategory(this.categoryId, this.state.currentPage * this.PAGE_SIZE);

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
                ids.push(singleObj.Post.id);
            }

            const likesResponse = await this.api.getPostsLikes(ids);

            if (likesResponse.success) {
                this.setState({
                    postLikes: likesResponse.data.likes,
                });
            }
        }
    }

    handleNewPostText(event) {
        this.setState({
            newPostText: event.target.value,
            newPosError: event.target.value.length === 0,
        });
    }

    async onLikeClicked(post_id) {
        const posts = this.state.posts;
        for (let post of posts) {
            if (post.Post.id === post_id) {
                post.Post.likes++;
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

    getLikeValue(postObj) {
        if (!this.api.isCacheEnabled()) {
            return postObj.likes;
        } else {
            if (Object.keys(this.state.postLikes).length === 0) {
                return '...';
            } else {
                return this.state.postLikes[postObj.id];
            }
        }
    }

    submitNewPost() {
        if (!this.createPostSubmitClick) {
            this.setState({ newPostError: false, errorMessage: '' }, async () => {
                const userId = localStorage.getItem('user_id');
                const response = await this.api.createPost(this.state.newPostText, this.categoryId, userId);

                if (response.success) {
                    this.createPostModal.hide();
                    this.getPostData();
                    this.setState(
                        {
                            currentPage: 0,
                            newPostError: false,
                            errorMessage: '',
                            newPostText: '',
                        },
                        () => (this.createPostSubmitClick = false),
                    );
                } else {
                    if (response.validError) {
                        this.setState(
                            {
                                newPostError: true,
                                errorMessage: response.errorMessage,
                            },
                            () => (this.createPostSubmitClick = false),
                        );
                    } else {
                        this.props.showAlert();
                        this.registerButtonClicked = false;
                    }
                }
            });
        }
    }

    handlePreviousPage() {
        if (this.state.currentPage < 1) {
            return;
        }

        this.setState(
            {
                currentPage: this.state.currentPage - 1,
            },
            () => this.getPostData(),
        );
    }

    handleNextPage() {
        if (this.state.currentPage + 1 >= Math.ceil(this.state.postCount / this.PAGE_SIZE)) {
            return;
        }

        this.setState(
            {
                currentPage: this.state.currentPage + 1,
            },
            () => this.getPostData(),
        );
    }

    renderPostPageControl() {
        const currPageFirst = this.PAGE_SIZE * this.state.currentPage + 1;
        const currPageLast =
            this.PAGE_SIZE * this.state.currentPage + this.PAGE_SIZE < this.state.postCount
                ? this.PAGE_SIZE * this.state.currentPage + this.PAGE_SIZE
                : this.state.postCount;
        return (
            <div className="">
                <div className="d-flex flex-row justify-content-center">
                    <button
                        className="btn btn-primary"
                        disabled={this.state.currentPage < 1}
                        onClick={this.handlePreviousPage}
                    >
                        <ion-icon class="pagination-icon pe-1" name="chevron-back-outline"></ion-icon>
                        Previous
                    </button>
                    <p className="px-3 mb-0 mt-1">
                        {'Showing '}
                        <b>{currPageFirst}</b>
                        {' - '}
                        <b>{currPageLast}</b>
                        {' out of '}
                        <b>{this.state.postCount}</b>
                    </p>
                    <button
                        className="btn btn-primary"
                        disabled={this.state.currentPage + 1 >= Math.ceil(this.state.postCount / this.PAGE_SIZE)}
                        onClick={this.handleNextPage}
                    >
                        <ion-icon class="pagination-icon pe-1" name="chevron-forward-outline"></ion-icon>
                        Next
                    </button>
                </div>
            </div>
        );
    }

    renderCreatePostButton() {
        if (this.props.loggedIn === LOGGED_IN_TRUE) {
            return (
                <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPostModal">
                    Create post
                </button>
            );
        } else if (this.props.loggedIn === LOGGED_IN_UNKNOWN) {
            return null;
        } else {
            return <p>Login to create post</p>;
        }
    }

    renderCreatePostModal() {
        return (
            <div
                className="modal fade"
                id="createPostModal"
                tabIndex="-1"
                aria-labelledby="createPostModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="createPostModalLabel">
                                Create post
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                data-bs-dismiss="modal"
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <textarea
                                className={'mb-3 form-control' + (this.state.newPostError ? ' is-invalid' : '')}
                                type={'text'}
                                rows={5}
                                placeholder={'Write about something...'}
                                value={this.state.newPostText}
                                onChange={this.handleNewPostText}
                            />
                            <p className="error-message">{this.state.errorMessage}</p>
                            <p>Please use appropriate category for your post</p>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
                            <button type="button" className="btn btn-primary" onClick={this.submitNewPost}>
                                Create post
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
                <h2>{this.state.categoryName}</h2>
                {this.renderCreatePostButton()}
                {this.renderCreatePostModal()}
                <hr />
                {this.renderPostPageControl()}
                <div className="d-flex flex-column">
                    {this.state.posts.map((post) => (
                        <div key={post.Post.id} className="event-card mt-4 px-4 pt-3 pb-2">
                            <div className="row">
                                <div className="col-lg-10">
                                    <h3>{post.Post.text}</h3>
                                    <a href={`/user/${post.username}`}>{post.username}</a>
                                </div>
                                <div className="col-lg-2">
                                    <p className="">{new Date(post.Post.created_at).toLocaleString()}</p>
                                    <div className="d-block">
                                        <button
                                            className="thumb-up-button d-flex flex-row"
                                            onClick={() => this.onLikeClicked(post.Post.id)}
                                        >
                                            <ion-icon class="mt-1 ms-2 px-1 py-2" name="thumbs-up-sharp"></ion-icon>
                                            <p className="likes-text mb-0 px-2 py-2">{this.getLikeValue(post.Post)}</p>
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
