import User from "../module/auth";


//detail
export const getUser = async (id) => {
    return await User.findById(id);
}

export const getDataUser = async (data) => {
    return await User.findOne(data);
}
//get all
export const getAll = async (req, res) => {
    return await User.find();
}


//add
export const addUser = async (user) => {
    // const newUser = new User(user)
    return await new User(user).save();
}

//delete
export const deleteUser = async (_id) => {
    // return await User.deleteOne({'_id': _id});
    // return await User.findById(_id);
    return await User.findOneAndDelete({ '_id': _id });
}

//edit
export const editUser = async (id, data) => {
    return await User.findByIdAndUpdate(id, data, { new: true });
}

//edit image

export const editImg = async (id, image) => {
    return await User.findByIdAndUpdate(id, image);
}