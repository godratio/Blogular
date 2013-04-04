
exports.upload = function (req, res) {
    var name = req.files.userPhoto.name;
    fs.readFile(req.files.userPhoto.path, function (err, data) {
        var newPath = __dirname + "/public/uploads/" + name;
        fs.writeFile(newPath, data, function (err) {
            res.redirect("back");
        });
    });
};