const initStatus = (state = false, action) => {
    switch(action.type) {
        case 'isAuth':
            return action.data;
        default:
            return state;
    }
}

export default initStatus;