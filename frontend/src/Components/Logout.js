import React from 'react';
import ApiService from '../ApiService';

export default class Logout extends React.Component {
    constructor(props) {
        super(props);

        this.api = ApiService.getInstance();
    }
    
    async componentDidMount() {
        this.props.callLogout();
        await this.api.logout();
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        window.location.href = '/';
    }

    render() {
        return <p>Logging out...</p>;
    }
}
