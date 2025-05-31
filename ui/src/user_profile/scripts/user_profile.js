      import { authController } from '../scripts/controllers/AuthController.js';
      
      document.addEventListener('DOMContentLoaded', () => {
        // Logout button handler
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', async () => {
          await authController.handleLogout();
          window.location.href = '../image_upload/image_upload.html';
        });

        // Initialize projects grid
        initProjectsGrid();
      });

      function initProjectsGrid() {
        const projectsGrid = document.getElementById('projects-grid');
        
        // Function to add a new project
        window.addProject = function(imageUrl, title, date) {
          const projectItem = document.createElement('div');
          projectItem.className = 'project-item';
          
          projectItem.innerHTML = `
            <img src="${imageUrl}" alt="${title}" class="project-image">
            <div class="project-overlay">
              <h3 class="project-title">${title}</h3>
              <div class="project-date">${date}</div>
            </div>
          `;

          // Add click event listener
          projectItem.addEventListener('click', () => {
            // Handle project click - you can add navigation or preview functionality here
            console.log('Project clicked:', title);
          });

          projectsGrid.appendChild(projectItem);
        };

        // Add placeholder projects
        const placeholders = [
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?landscape',
            title: 'Landscape Project',
            date: 'March 15, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?portrait',
            title: 'Portrait Study',
            date: 'March 14, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?architecture',
            title: 'Architecture Series',
            date: 'March 13, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?nature',
            title: 'Nature Collection',
            date: 'March 12, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?abstract',
            title: 'Abstract Art',
            date: 'March 11, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?minimal',
            title: 'Minimalist Design',
            date: 'March 10, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?landscape',
            title: 'Landscape Project',
            date: 'March 15, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?portrait',
            title: 'Portrait Study',
            date: 'March 14, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?architecture',
            title: 'Architecture Series',
            date: 'March 13, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?nature',
            title: 'Nature Collection',
            date: 'March 12, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?abstract',
            title: 'Abstract Art',
            date: 'March 11, 2024'
          },
          {
            imageUrl: 'https://source.unsplash.com/random/800x800?minimal',
            title: 'Minimalist Design',
            date: 'March 10, 2024'
          }
        
        ];

        // Add all placeholder projects
        placeholders.forEach(project => {
          window.addProject(project.imageUrl, project.title, project.date);
        });
      }
    
