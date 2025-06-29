
CREATE DATABASE image_processing_db;
USE image_processing_db;

-- Users table
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    aw_id VARCHAR(255) UNIQUE NOT NULL COMMENT 'Appwrite user ID for authentication integration'
);

-- Images data table  
CREATE TABLE images_data (
    image_data_id INT PRIMARY KEY AUTO_INCREMENT,
    base64_data LONGTEXT NOT NULL COMMENT 'Image content encoded in Base64',
    mime_type VARCHAR(100) NOT NULL COMMENT 'Image MIME type (e.g., image/jpeg, image/png)'
);

-- Images table
CREATE TABLE images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    id_user INT NOT NULL,
    id_image_data INT NOT NULL,
    real_width_mm DECIMAL(10,2) COMMENT 'Real width in millimeters',
    real_height_mm DECIMAL(10,2) COMMENT 'Real height in millimeters', 
    corner_coordinates JSON COMMENT 'Corner coordinates data',
    transformations JSON COMMENT 'Image transformation data',
    x_ratio DECIMAL(10,6) COMMENT 'X-axis scaling ratio',
    y_ratio DECIMAL(10,6) COMMENT 'Y-axis scaling ratio',
    gaussian_blur INT COMMENT 'Gaussian blur parameter for edge detection',
    canny_threshold_1 INT COMMENT 'First Canny threshold value',
    canny_threshold_2 INT COMMENT 'Second Canny threshold value',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (id_user) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (id_image_data) REFERENCES images_data(image_data_id) ON DELETE CASCADE
);

-- Edge detection preferences table
CREATE TABLE edge_detection_preferences (
    preset_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    gaussian_blur INT NOT NULL COMMENT 'Gaussian blur value',
    canny_threshold_1 INT NOT NULL COMMENT 'First Canny threshold',
    canny_threshold_2 INT NOT NULL COMMENT 'Second Canny threshold', 
    morph_kernel_size INT NOT NULL COMMENT 'Morphological operation kernel size',
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    
    -- Ensure unique preset per user
    UNIQUE KEY unique_user_preset (user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_images_user ON images(id_user);
CREATE INDEX idx_images_created_at ON images(created_at);
CREATE INDEX idx_edge_preferences_user ON edge_detection_preferences(user_id);
