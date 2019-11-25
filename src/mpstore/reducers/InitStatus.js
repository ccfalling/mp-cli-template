const initStatus = (state = 0, action) => {
    switch(action.type) {
        case 'initStatus':
            return action.data;
        default:
            return state;
    }
}

export default initStatus;