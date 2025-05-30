-- Image Processing Database Schema - Updated

-- 1. Users table
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    aw_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Image data table (separate for performance)
CREATE TABLE image_data (
    image_data_id INT PRIMARY KEY AUTO_INCREMENT,
    base64_data LONGTEXT NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    file_size_bytes INT,
    checksum VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Images table (metadata only)
CREATE TABLE images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    project_id INT NULL,
    id_user VARCHAR(255) NOT NULL,
    id_image_data INT NOT NULL,
    original_filename VARCHAR(255),
    real_width_mm DECIMAL(10,2),
    real_height_mm DECIMAL(10,2),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    corner_coordinates JSON,
    transformations JSON,
    x_ratio DECIMAL(10,6),
    y_ratio DECIMAL(10,6),
    gaussian_blur DECIMAL(5,2),
    canny_threshold_1 INT,
    canny_threshold_2 INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (id_user) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (id_image_data) REFERENCES image_data(image_data_id) ON DELETE CASCADE,
    INDEX idx_id_user (id_user),
    INDEX idx_project_id (project_id)
);

-- 4. Processed image data table (for processed images)
CREATE TABLE processed_image_data (
    processed_data_id INT PRIMARY KEY AUTO_INCREMENT,
    base64_data LONGTEXT NOT NULL,
    image_type ENUM('corrected', 'edge', 'contoured') NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/jpeg',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Image processing sessions table
CREATE TABLE image_processing_sessions (
    session_id INT PRIMARY KEY AUTO_INCREMENT,
    image_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    corner_coordinates JSON,
    transformations JSON,
    x_ratio DECIMAL(10,6),
    y_ratio DECIMAL(10,6),
    edge_detection_settings JSON,
    corrected_image_data_id INT NULL,
    edge_image_data_id INT NULL,
    contoured_image_data_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (image_id) REFERENCES images(image_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (corrected_image_data_id) REFERENCES processed_image_data(processed_data_id) ON DELETE SET NULL,
    FOREIGN KEY (edge_image_data_id) REFERENCES processed_image_data(processed_data_id) ON DELETE SET NULL,
    FOREIGN KEY (contoured_image_data_id) REFERENCES processed_image_data(processed_data_id) ON DELETE SET NULL,
    INDEX idx_image_id (image_id),
    INDEX idx_user_id (user_id)
);

-- 6. Edge detection presets table
CREATE TABLE edge_detection_preferences (
    preset_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    gaussian_blur DECIMAL(5,2) DEFAULT 1.0,
    canny_threshold_1 INT DEFAULT 50,
    canny_threshold_2 INT DEFAULT 150,
    morph_kernel_size INT DEFAULT 3,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    UNIQUE KEY unique_user_preset (user_id, name)
);

-- 7. User preferences table
CREATE TABLE user_preferences (
    user_id VARCHAR(255) PRIMARY KEY,
    default_edge_detection_settings JSON,
    default_drawer_width_mm DECIMAL(8,2) DEFAULT 500.0,
    default_drawer_height_mm DECIMAL(8,2) DEFAULT 300.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Add some useful indexes for performance
CREATE INDEX idx_images_upload_date ON images(upload_date);
CREATE INDEX idx_sessions_created_at ON image_processing_sessions(created_at);
CREATE INDEX idx_image_data_checksum ON image_data(checksum);

-- Optional: Add some constraints for data integrity
ALTER TABLE images 
ADD CONSTRAINT chk_positive_dimensions 
CHECK (real_width_mm > 0 AND real_height_mm > 0);

ALTER TABLE edge_detection_preferences
ADD CONSTRAINT chk_positive_thresholds
CHECK (canny_threshold_1 > 0 AND canny_threshold_2 > 0 AND canny_threshold_1 < canny_threshold_2);

ALTER TABLE user_preferences
ADD CONSTRAINT chk_positive_drawer_dimensions
CHECK (default_drawer_width_mm > 0 AND default_drawer_height_mm > 0);