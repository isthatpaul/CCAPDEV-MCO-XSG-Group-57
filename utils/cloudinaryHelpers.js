function extractPublicIdFromUrl(url) {
    if (!url || !url.startsWith('https://res.cloudinary.com')) {
        return null;
    }

    try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;

        const pathParts = parts[1].split('/');
        const startIdx = pathParts[0].startsWith('v') ? 1 : 0;
        const publicId = pathParts.slice(startIdx).join('/');

        return publicId.split('.')[0];
    } catch (err) {
        console.error('Error extracting public_id:', err);
        return null;
    }
}

module.exports = {
    extractPublicIdFromUrl
};