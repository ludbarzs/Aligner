import { Client, Databases, ID, Query } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('68318dce002126d5e349');

const databases = new Databases(client);

// Database and collection IDs - you'll need to create these in Appwrite Console
const DATABASE_ID = 'aligner_db';
const COLLECTIONS = {
    IMAGES: 'images',
    IMAGE_SETTINGS: 'image_settings',
    PROJECTS: 'projects',
    TAGS: 'tags',
    IMAGE_TAGS: 'image_tags'
};

export const databaseService = {
    // Project Operations
    async createProject(userId, name, description = '') {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.PROJECTS,
                ID.unique(),
                {
                    user_id: userId,
                    name,
                    description,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error creating project:', error);
            throw error;
        }
    },

    // Image Operations
    async saveImage(userId, projectId, imageFileId, filename) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.IMAGES,
                ID.unique(),
                {
                    user_id: userId,
                    project_id: projectId,
                    file_id: imageFileId,
                    filename,
                    uploaded_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error saving image:', error);
            throw error;
        }
    },

    // Image Settings Operations
    async saveImageSettings(imageId, settings) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.IMAGE_SETTINGS,
                ID.unique(),
                {
                    image_id: imageId,
                    coordinates: settings.coordinates, // { x, y }
                    rotation: settings.rotation,
                    scale: settings.scale,
                    is_mirrored: settings.is_mirrored,
                    updated_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error saving image settings:', error);
            throw error;
        }
    },

    // Tag Operations
    async createTag(name) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.TAGS,
                ID.unique(),
                {
                    name,
                    created_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    },

    // Image Tag Operations
    async addTagToImage(imageId, tagId) {
        try {
            return await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.IMAGE_TAGS,
                ID.unique(),
                {
                    image_id: imageId,
                    tag_id: tagId
                }
            );
        } catch (error) {
            console.error('Error adding tag to image:', error);
            throw error;
        }
    },

    // Fetch Operations
    async getUserProjects(userId) {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.PROJECTS,
                [Query.equal('user_id', userId)]
            );
        } catch (error) {
            console.error('Error fetching user projects:', error);
            throw error;
        }
    },

    async getProjectImages(projectId) {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.IMAGES,
                [Query.equal('project_id', projectId)]
            );
        } catch (error) {
            console.error('Error fetching project images:', error);
            throw error;
        }
    },

    async getImageSettings(imageId) {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.IMAGE_SETTINGS,
                [Query.equal('image_id', imageId)]
            );
        } catch (error) {
            console.error('Error fetching image settings:', error);
            throw error;
        }
    },

    async getImageTags(imageId) {
        try {
            return await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.IMAGE_TAGS,
                [Query.equal('image_id', imageId)]
            );
        } catch (error) {
            console.error('Error fetching image tags:', error);
            throw error;
        }
    }
}; 