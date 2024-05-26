import { ApiResponse } from './types';

export default class ApiService {
    public static instance: ApiService;

    private API_BASE_URL: string;
    private PORT: number;

    private CACHE_BASE_URL: string;
    private CACHE_PORT: number;
    private CACHE_ENABLED: boolean;

    constructor() {
        this.API_BASE_URL = '';
        this.PORT = 0;

        this.CACHE_BASE_URL = '';
        this.CACHE_PORT = 0;
        this.CACHE_ENABLED = false;
    }

    static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }

        return ApiService.instance;
    }

    setBaseUrl(apiBaseUrl: string) {
        this.API_BASE_URL = apiBaseUrl;
    }

    setPort(port: number) {
        this.PORT = port;
    }

    setCacheUrl(baseCacheUrl: string) {
        this.CACHE_BASE_URL = baseCacheUrl;
    }

    setCachePort(cachePort: number) {
        this.CACHE_PORT = cachePort;
    }

    setCacheEnabled(cacheEnabled: boolean) {
        this.CACHE_ENABLED = cacheEnabled;
    }

    /**
     * Handle of login user request
     * @param username
     * @param password
     * @returns - response data
     */
    async login(username: string, password: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async register(username: string, email: string, password: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return this.constructorSucessResponse(data);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async refreshToken() {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/refresh-token/`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = {};

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async logout() {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/logout`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getUserInfo(username: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/user/${username}/info`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getCategories() {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/get-categories`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getCategoryName(categoryId: number) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/get-category-name/${categoryId}`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getNumberOfPostsInCategory(categoryId: number) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/get-category-post-count/${categoryId}`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getPostsInCategory(categoryId: number, offset: number) {
        try {
            const response = await fetch(
                `${this.API_BASE_URL}:${this.PORT}/get-category-posts/${categoryId}?${new URLSearchParams({
                    offset: offset.toString(),
                })}`,
                {
                    method: 'POST',
                },
            );

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getNumberOfPostsOfUser(userId: number) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/get-user-post-count/${userId}`, {
                method: 'POST',
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async getPostsOfUser(userId: number, offset: number) {
        try {
            const response = await fetch(
                `${this.API_BASE_URL}:${this.PORT}/get-user-posts/${userId}?${new URLSearchParams({
                    offset: offset.toString(),
                })}`,
                {
                    method: 'POST',
                },
            );

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async createPost(text: string, categoryId: number, userId: number) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/create-post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    text: text,
                    category_id: categoryId,
                    owner_id: userId,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                return this.constructorSucessResponse(data);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async likePost(post_id: number) {
        if (this.CACHE_ENABLED) {
            try {
                const response = await fetch(`${this.CACHE_BASE_URL}:${this.CACHE_PORT}/like-post/${post_id}`, {
                    method: 'POST',
                });

                if (response.ok) {
                    return this.constructorSucessResponse(null);
                } else {
                    if (response.status === 400) {
                        const data = await response.json();
                        return this.constructValidErrorResponse(data.detail);
                    } else {
                        return this.constructUnknownErrorResponse();
                    }
                }
            } catch (e) {
                return this.constructUnknownErrorResponse();
            }
        } else {
            try {
                const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/like-post/${post_id}`, {
                    method: 'POST',
                });

                if (response.ok) {
                    return this.constructorSucessResponse(null);
                } else {
                    if (response.status === 400) {
                        const data = await response.json();
                        return this.constructValidErrorResponse(data.detail);
                    } else {
                        return this.constructUnknownErrorResponse();
                    }
                }
            } catch (e) {
                return this.constructUnknownErrorResponse();
            }
        }
    }

    async getPostsLikes(post_ids: number[]) {
        try {
            const response = await fetch(`${this.CACHE_BASE_URL}:${this.CACHE_PORT}/get-likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ post_ids: post_ids }),
            });

            if (response.ok) {
                const data = await response.json();

                return this.constructorSucessResponse(data);
            } else {
                if (response.status === 400) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async changeUsername(userId: number, newUsername: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/user/${userId}/change-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    new_username: newUsername,
                }),
            });

            if (response.ok) {
                return this.constructorSucessResponse(null);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async changeEmail(userId: number, newEmail: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/user/${userId}/change-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    new_email: newEmail,
                }),
            });

            if (response.ok) {
                return this.constructorSucessResponse(null);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async changePassword(userId: number, newPassword: string) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/user/${userId}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                return this.constructorSucessResponse(null);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    async deleteAccount(userId: number) {
        try {
            const response = await fetch(`${this.API_BASE_URL}:${this.PORT}/user/${userId}/remove-account`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (response.ok) {
                return this.constructorSucessResponse(null);
            } else {
                if (response.status >= 400 && response.status < 500) {
                    const data = await response.json();
                    return this.constructValidErrorResponse(data.detail);
                } else {
                    return this.constructUnknownErrorResponse();
                }
            }
        } catch (e) {
            return this.constructUnknownErrorResponse();
        }
    }

    isCacheEnabled(): boolean {
        return this.CACHE_ENABLED;
    }

    constructorSucessResponse(data: any): ApiResponse {
        return {
            success: true,
            data: data,
        };
    }

    constructValidErrorResponse(errorMessage: string): ApiResponse {
        return {
            success: false,
            validError: true,
            errorMessage: errorMessage,
        };
    }

    constructUnknownErrorResponse(): ApiResponse {
        return {
            success: false,
            validError: false,
            errorMessage: 'Error while communicating with the server',
        };
    }
}
