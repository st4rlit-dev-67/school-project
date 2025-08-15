const toggleBtn = document.getElementById('toggleAbout');
const aboutBox = document.getElementById('aboutBox');
const guideBtn = document.getElementById('toggleGuide');
const guideBox = document.getElementById('guideBox');
const textarea = document.querySelector('textarea');
const postsContainer = document.getElementById('posts');
const postTitle = document.getElementById('postTitle');
const fullAboutOverlay = document.getElementById('fullAboutOverlay');
const toggleFullAbout = document.getElementById('toggleFullAbout');
const closeFullAbout = document.getElementById('closeFullAbout');
const imageInput = document.getElementById('imageInput');
const postBtn = document.getElementById('postBtn');

const supabaseClient = supabase.createClient(
  'https://qjootrownqsdnvjrlhqo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqb290cm93bnFzZG52anJsaHFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTIyODIzNSwiZXhwIjoyMDcwODA0MjM1fQ.fd8QU8z6VSy8rmOWmJ0br-ZcBC0QlJWWUmxekmhewY0'
);

// Load posts on page load
window.addEventListener('load', loadPosts);

// Load posts from Supabase
async function loadPosts() {
  const { data: posts, error } = await supabaseClient
    .from('posts')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading posts:', error);
    return;
  }

  postsContainer.innerHTML = ''; // clear existing posts
  posts.forEach(renderPost);
}

// Render a single post
function renderPost(post) {
  const postEl = document.createElement('div');
  postEl.className = 'post-box posted';
  postEl.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content}</p>
    ${post.image_url ? `<img src="${post.image_url}" class="post-image" alt="Attached image">` : ''}
    <button class="delete-btn" data-id="${post.id}">Delete</button>
  `;
  postsContainer.appendChild(postEl);

  // Add delete handler
  const deleteBtn = postEl.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', async () => {
    const id = deleteBtn.dataset.id;
    if (id) {
      await supabaseClient.from('posts').delete().eq('id', id);
    }
    postEl.remove();
  });
}

// Toggle About box
toggleBtn.addEventListener('click', () => {
  aboutBox.style.display = (aboutBox.style.display === 'block') ? 'none' : 'block';
  guideBox.style.display = 'none'; // close guide if open
  fullAboutOverlay.style.display = 'none'; // close overlay if open
});

// Toggle Guide box
guideBtn.addEventListener('click', () => {
  guideBox.style.display = (guideBox.style.display === 'block') ? 'none' : 'block';
  aboutBox.style.display = 'none'; // close about if open
  fullAboutOverlay.style.display = 'none'; // close overlay if open
});

// Reset post title if empty
postTitle.addEventListener('blur', () => {
  if (!postTitle.textContent.trim()) {
    postTitle.textContent = 'blog post';
  }
});

// Toggle full About overlay
toggleFullAbout.addEventListener('click', () => {
  fullAboutOverlay.style.display = 'flex';
  aboutBox.style.display = 'none';
  guideBox.style.display = 'none';

  const content = fullAboutOverlay.querySelector('.full-about-content');
  content.classList.remove('bounce-in');
  void content.offsetWidth;
  content.classList.add('bounce-in');
});

closeFullAbout.addEventListener('click', () => {
  fullAboutOverlay.style.display = 'none';
});

// Handle post submission via button
postBtn.addEventListener('click', handlePost);

// Optional: allow Enter to submit (without Shift)
textarea.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handlePost();
  }
});

// Unified post handler
async function handlePost() {
  const text = textarea.value.trim();
  const title = postTitle.textContent.trim() || 'blog post';
  const file = imageInput.files[0];

  if (!text && !file) return;

  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const image_url = e.target.result;
      await savePost(title, text, image_url);
    };
    reader.readAsDataURL(file);
  } else {
    await savePost(title, text, null);
  }
}

// Save post to Supabase and render it immediately
async function savePost(title, content, image_url) {
  const { data, error } = await supabaseClient
    .from('posts')
    .insert([{ title, content, image_url }])
    .select()
    .single();

  if (error) {
    console.error('Error saving post:', error);
    return;
  }

  renderPost(data); // show the new post immediately
  textarea.value = '';
  postTitle.textContent = 'blog post';
  imageInput.value = '';
}
