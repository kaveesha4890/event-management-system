export const uploadEventImage = async (req,res) => {
    try {
        if (!req.file || !req.file.path) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const imageUrl = req.file.path;

        res.json({
            message: "Image uploaded successfully",
            imageUrl
    });
    } catch (error) {
        console.error("Image upload error: ", error);
        res.status(500).json({message: "Internal server error"})
    }
}