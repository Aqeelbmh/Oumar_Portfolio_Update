const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

const VIEWS = {
  messages: { title: 'Inbox', subtitle: 'Messages sent through the contact form.' },
  profile: { title: 'Profile & About', subtitle: 'Hero, photo, CV and about text.' },
  skills: { title: 'Skills', subtitle: 'Skill categories and their items.' },
  education: { title: 'Education', subtitle: 'Degrees and certificates.' },
  experience: { title: 'Experience', subtitle: 'Roles, companies and achievements.' },
  languages: { title: 'Languages', subtitle: 'Spoken languages and levels.' },
  certifications: { title: 'Certifications', subtitle: 'Certificates and achievements.' },
  links: { title: 'Links & Footer', subtitle: 'Social links, footer text and copyright.' },
};

const EDITORS = {
  profile: {
    title: 'Profile & About',
    intro: 'These values power the hero, the about section and the CV button.',
    kind: 'object',
    fields: [
      { key: 'name', label: 'Full name' },
      { key: 'subtitle', label: 'Hero subtitle' },
      {
        key: 'image',
        label: 'Profile image',
        type: 'image',
        span: 2,
        hint: 'Upload a photo or paste a path/URL. Uploads are resized to 1400px.',
      },
      { key: 'cvUrl', label: 'CV file', hint: 'Path or full URL to the PDF' },
      { key: 'cvFilename', label: 'CV download filename' },
      { key: 'aboutTitle', label: 'About title' },
      { key: 'aboutHeading', label: 'About heading' },
      {
        key: 'aboutParagraphs',
        label: 'About paragraphs',
        type: 'lines',
        span: 2,
        hint: 'One paragraph per line.',
      },
      {
        key: 'aboutSections',
        label: 'About blocks',
        type: 'cards',
        itemName: 'Block',
        titleKey: 'title',
        addLabel: 'Add block',
        fields: [
          { key: 'title', label: 'Block title' },
          { key: 'text', label: 'Block text', type: 'textarea', span: 2 },
        ],
      },
    ],
  },

  skills: {
    title: 'Skills',
    intro: 'Each card is a skill category. Font Awesome classes control the icon.',
    kind: 'cards',
    itemName: 'Category',
    titleKey: 'category',
    addLabel: 'Add category',
    fields: [
      { key: 'category', label: 'Category name', span: 2 },
      {
        key: 'items',
        label: 'Skills in this category',
        type: 'cards',
        itemName: 'Skill',
        titleKey: 'label',
        addLabel: 'Add skill',
        fields: [
          { key: 'icon', label: 'Font Awesome class', hint: 'e.g. fas fa-globe' },
          { key: 'label', label: 'Label' },
        ],
      },
    ],
  },

  education: {
    title: 'Education',
    kind: 'cards',
    itemName: 'Entry',
    titleKey: 'degree',
    addLabel: 'Add education entry',
    fields: [
      { key: 'dates', label: 'Dates', hint: 'e.g. 2020 - 2024' },
      { key: 'degree', label: 'Degree / programme' },
      { key: 'institution', label: 'Institution' },
      { key: 'location', label: 'Location' },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
      { key: 'certificateUrl', label: 'Certificate link', span: 2, hint: 'Leave empty to hide the button' },
    ],
  },

  experience: {
    title: 'Experience',
    kind: 'cards',
    itemName: 'Role',
    titleKey: 'role',
    addLabel: 'Add role',
    fields: [
      { key: 'dates', label: 'Dates' },
      { key: 'role', label: 'Role' },
      { key: 'company', label: 'Company' },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
      {
        key: 'achievements',
        label: 'Achievements',
        type: 'lines',
        span: 2,
        hint: 'One achievement per line.',
      },
    ],
  },

  languages: {
    title: 'Languages',
    kind: 'cards',
    itemName: 'Language',
    titleKey: 'name',
    addLabel: 'Add language',
    fields: [
      { key: 'name', label: 'Language' },
      { key: 'level', label: 'Level', hint: 'e.g. Native, Advanced' },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
    ],
  },

  certifications: {
    title: 'Certifications',
    kind: 'cards',
    itemName: 'Certificate',
    titleKey: 'title',
    addLabel: 'Add certificate',
    fields: [
      { key: 'title', label: 'Title', span: 2 },
      { key: 'organization', label: 'Organisation' },
      { key: 'year', label: 'Year' },
      { key: 'description', label: 'Description', type: 'textarea', span: 2 },
      { key: 'certificateUrl', label: 'Certificate link', span: 2, hint: 'Leave empty to hide the button' },
    ],
  },

  links: {
    title: 'Links & Footer',
    intro: 'Social links and footer copy. Use full https:// URLs.',
    kind: 'object',
    fields: [
      { key: 'whatsapp', label: 'WhatsApp link', hint: 'e.g. https://wa.me/22376123456' },
      { key: 'instagram', label: 'Instagram link' },
      { key: 'facebook', label: 'Facebook link' },
      { key: 'telegram', label: 'Telegram link' },
      { key: 'footerAbout', label: 'Footer about text', type: 'textarea', span: 2 },
      { key: 'copyright', label: 'Copyright holder', span: 2 },
    ],
  },
};

const state = {
  content: null,
  saved: null,
  section: 'messages',
  filter: 'all',
  messages: [],
  stats: { total: 0, unread: 0, read: 0, archived: 0 },
  expanded: new Set(),
  dirty: false,
};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  bindLogin();
  bindNavigation();
  bindEditorActions();
  bindMessageActions();

  try {
    const me = await api('/api/auth/me');
    if (me.authenticated) await enterApp();
  } catch (error) {
    console.error(error);
  }
}

/* ---------------------------------------------------------------- helpers */

function h(tag, props = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === 'class') element.className = value;
    else if (key === 'text') element.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'value') element.value = value;
    else element.setAttribute(key, value);
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return element;
}

function icon(className) {
  return h('i', { class: className, 'aria-hidden': 'true' });
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* empty body */
  }

  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

let toastTimer;
function toast(message, kind = 'ok') {
  const element = $('#toast');
  element.textContent = message;
  element.className = `toast ${kind === 'error' ? 'error' : ''} visible`;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    element.className = 'toast';
    setTimeout(() => {
      element.hidden = true;
    }, 220);
  }, 2800);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(String(value).replace(' ', 'T') + 'Z');
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

/* ------------------------------------------------------------------ auth */

function bindLogin() {
  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = $('#loginBtn');
    const errorBox = $('#loginError');
    errorBox.hidden = true;
    button.disabled = true;
    button.textContent = 'Signing in…';

    try {
      await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.value.trim(),
          password: form.password.value,
        }),
      });
      form.reset();
      await enterApp();
    } catch (error) {
      errorBox.textContent = error.message;
      errorBox.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = 'Sign in';
    }
  });

  $('#logoutBtn').addEventListener('click', async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch {
      /* ignore */
    }
    showLogin();
  });
}

async function enterApp() {
  try {
    await Promise.all([loadContent(), loadMessages()]);
  } catch (error) {
    if (error.status === 401) return showLogin();
    toast(error.message, 'error');
    return;
  }

  $('#loginView').hidden = true;
  $('#appView').hidden = false;
  setSection('messages');
}

function showLogin() {
  $('#appView').hidden = true;
  $('#loginView').hidden = false;
  state.content = null;
  state.saved = null;
  state.messages = [];
  state.expanded.clear();
  state.dirty = false;
  setSaveState('');
}

/* --------------------------------------------------------------- content */

async function loadContent() {
  const data = await api('/api/content');
  state.content = data.content;
  state.saved = deepClone(data.content);
}

function setSection(section) {
  if (!VIEWS[section]) return;

  if (section !== 'messages' && !state.content) return;

  state.section = section;

  for (const button of $$('#sideNav button')) {
    button.classList.toggle('active', button.dataset.view === section);
  }

  $('#viewTitle').textContent = VIEWS[section].title;
  $('#viewSubtitle').textContent = VIEWS[section].subtitle;

  const messagesView = $('#messagesView');
  const editorView = $('#editorView');

  if (section === 'messages') {
    messagesView.hidden = false;
    editorView.hidden = true;
    setSaveState('');
    renderMessages();
  } else {
    messagesView.hidden = true;
    editorView.hidden = false;
    setSaveState(
      state.dirty ? 'Unsaved changes' : 'All changes saved',
      state.dirty ? 'dirty' : 'saved'
    );
    renderEditor();
  }
}

function bindNavigation() {
  $('#sideNav').addEventListener('click', (event) => {
    const button = event.target.closest('button[data-view]');
    if (button) setSection(button.dataset.view);
  });
}

function bindEditorActions() {
  $('#saveContentBtn').addEventListener('click', saveContent);
  $('#resetSectionBtn').addEventListener('click', resetSection);

  window.addEventListener('beforeunload', (event) => {
    if (!state.dirty) return;
    event.preventDefault();
    event.returnValue = '';
  });
}

function setSaveState(text, kind = '') {
  const element = $('#saveState');
  element.textContent = text;
  element.className = `save-state ${kind}`;
}

function markDirty() {
  state.dirty = true;
  setSaveState('Unsaved changes', 'dirty');
}

async function saveContent() {
  if (!state.content) return;
  const button = $('#saveContentBtn');
  button.disabled = true;
  setSaveState('Saving…', 'saved');

  try {
    const data = await api('/api/content', {
      method: 'PUT',
      body: JSON.stringify({ content: state.content }),
    });
    state.content = data.content;
    state.saved = deepClone(data.content);
    state.dirty = false;
    setSaveState('All changes saved', 'saved');
    toast('Content saved');
  } catch (error) {
    if (error.status === 401) return showLogin();
    setSaveState('Not saved', 'dirty');
    toast(error.message, 'error');
  } finally {
    button.disabled = false;
  }
}

function resetSection() {
  if (!state.saved || state.section === 'messages') return;
  const name = VIEWS[state.section].title;
  if (!window.confirm(`Discard unsaved changes in ${name}?`)) return;

  state.content[state.section] = deepClone(state.saved[state.section]);
  state.dirty = JSON.stringify(state.content) !== JSON.stringify(state.saved);
  setSaveState(
    state.dirty ? 'Unsaved changes' : 'All changes saved',
    state.dirty ? 'dirty' : 'saved'
  );
  renderEditor();
}

/* --------------------------------------------------------- content editor */

function renderEditor() {
  const schema = EDITORS[state.section];
  const root = $('#editorForm');
  root.replaceChildren();
  if (!schema) return;

  if (schema.kind === 'object') {
    const data = state.content[state.section];
    const simpleFields = schema.fields.filter((field) => field.type !== 'cards');

    if (simpleFields.length > 0) {
      const card = h('div', { class: 'form-card' });
      if (schema.title) card.append(h('h2', { text: schema.title }));
      if (schema.intro) card.append(h('p', { class: 'muted', text: schema.intro }));

      const grid = h('div', { class: 'form-grid' });
      for (const field of simpleFields) {
        grid.append(renderField(field, data));
      }
      card.append(grid);
      root.append(card);
    }

    for (const field of schema.fields.filter((item) => item.type === 'cards')) {
      root.append(
        cardsControl(field, data[field.key] || [], (next) => {
          data[field.key] = next;
          markDirty();
        }, true)
      );
    }
    return;
  }

  root.append(
    cardsControl(
      { ...schema, key: 'items' },
      state.content[state.section] || [],
      (next) => {
        state.content[state.section] = next;
        markDirty();
      },
      false
    )
  );
}

function renderField(field, target) {
  if (field.type === 'cards') {
    return cardsControl(
      field,
      target[field.key] || [],
      (next) => {
        target[field.key] = next;
        markDirty();
      },
      true
    );
  }

  if (field.type === 'image') return imageField(field, target);

  const wrapper = h('label', {
    class: `field${field.span === 2 ? ' span-2' : ''}`,
  });
  wrapper.append(h('span', { text: field.label }));

  if (field.type === 'lines') {
    const textarea = h('textarea', { rows: 5 });
    textarea.value = Array.isArray(target[field.key]) ? target[field.key].join('\n') : '';
    textarea.addEventListener('input', () => {
      target[field.key] = textarea.value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      markDirty();
    });
    wrapper.append(textarea);
  } else if (field.type === 'textarea') {
    const textarea = h('textarea', { rows: 4 });
    textarea.value = target[field.key] ?? '';
    textarea.addEventListener('input', () => {
      target[field.key] = textarea.value;
      markDirty();
    });
    wrapper.append(textarea);
  } else {
    const input = h('input', { type: 'text' });
    input.value = target[field.key] ?? '';
    input.addEventListener('input', () => {
      target[field.key] = input.value;
      markDirty();
    });
    wrapper.append(input);
  }

  if (field.hint) wrapper.append(h('span', { class: 'hint', text: field.hint }));
  return wrapper;
}

function imageField(field, target) {
  const wrapper = h('div', { class: 'field image-field' });
  wrapper.append(h('span', { text: field.label }));

  const preview = h('div', { class: 'image-preview' });
  const image = h('img', { alt: 'Current image preview' });
  const placeholder = h('span', { class: 'image-placeholder', text: 'No image' });
  preview.append(image, placeholder);

  const controls = h('div', { class: 'image-controls' });
  const fileInput = h('input', {
    type: 'file',
    accept: 'image/jpeg,image/png,image/webp,image/gif',
    hidden: 'hidden',
  });
  const uploadButton = h(
    'button',
    { type: 'button', class: 'btn ghost' },
    icon('fas fa-upload'),
    'Upload photo'
  );
  const urlInput = h('input', { type: 'text', placeholder: 'profile-image.jpg or https://…' });

  controls.append(
    fileInput,
    uploadButton,
    urlInput,
    h('span', { class: 'hint', text: field.hint || 'Upload a photo or paste a path/URL.' })
  );
  wrapper.append(h('div', { class: 'image-editor' }, preview, controls));

  const syncPreview = () => {
    const src = target[field.key];
    image.hidden = !src;
    placeholder.hidden = Boolean(src);
    if (src) image.src = src;
    else image.removeAttribute('src');
  };

  const apply = (value) => {
    target[field.key] = value;
    urlInput.value = value || '';
    syncPreview();
    markDirty();
  };

  urlInput.value = target[field.key] || '';
  syncPreview();

  urlInput.addEventListener('input', () => {
    target[field.key] = urlInput.value.trim();
    markDirty();
  });
  urlInput.addEventListener('change', syncPreview);

  uploadButton.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!String(file.type).startsWith('image/')) {
      toast('Choose a JPEG, PNG, WebP or GIF image', 'error');
      return;
    }

    const label = uploadButton.innerHTML;
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading…';

    try {
      const dataUrl = await prepareImage(file);
      const data = await api('/api/assets', {
        method: 'POST',
        body: JSON.stringify({ dataUrl }),
      });
      apply(data.url);
      toast('Image uploaded — press Save changes');
    } catch (error) {
      if (error.status === 401) return showLogin();
      toast(error.message || 'Could not upload that image', 'error');
    } finally {
      uploadButton.innerHTML = label;
      uploadButton.disabled = false;
      fileInput.value = '';
    }
  });

  return wrapper;
}

function prepareImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const source = new Image();
      source.onerror = () => reject(new Error('That file is not a readable image'));
      source.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(source.width, source.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(source.width * scale));
        canvas.height = Math.max(1, Math.round(source.height * scale));
        const context = canvas.getContext('2d');
        context.fillStyle = '#f6f1e7';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(source, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.86));
      };
      source.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function cardsControl(field, items, setItems, nested) {
  let current = items;

  const wrapper = h('div', {
    class: nested ? 'form-card nested' : 'form-card',
  });

  const addButton = h(
    'button',
    { type: 'button', class: 'add-btn' },
    icon('fas fa-plus'),
    field.addLabel || 'Add'
  );

  wrapper.append(
    h(
      'div',
      { class: 'cards-head' },
      h(
        'div',
        {},
        h('h3', { text: field.label }),
        field.hint ? h('p', { class: 'hint', text: field.hint }) : null
      ),
      addButton
    )
  );

  const list = h('div', { class: 'cards' });
  wrapper.append(list);

  function update(next) {
    current = next;
    setItems(next);
    render();
  }

  addButton.addEventListener('click', () => {
    update([...current, blankItem(field)]);
  });

  function render() {
    list.replaceChildren();

    if (current.length === 0) {
      list.append(h('p', { class: 'hint', text: 'Nothing here yet. Use the add button.' }));
      return;
    }

    current.forEach((item, index) => {
      const title =
        (field.titleKey && item[field.titleKey]) || `${field.itemName || 'Item'} ${index + 1}`;

      const moveButton = (direction) => {
        const target = index + direction;
        const outOfRange = target < 0 || target >= current.length;
        const button = h(
          'button',
          {
            type: 'button',
            class: 'icon-btn',
            title: direction < 0 ? 'Move up' : 'Move down',
            'aria-label': direction < 0 ? 'Move up' : 'Move down',
            disabled: outOfRange ? 'disabled' : null,
          },
          icon(`fas fa-arrow-${direction < 0 ? 'up' : 'down'}`)
        );
        button.addEventListener('click', () => {
          if (outOfRange) return;
          const next = [...current];
          [next[index], next[target]] = [next[target], next[index]];
          update(next);
        });
        return button;
      };

      const removeButton = h(
        'button',
        {
          type: 'button',
          class: 'icon-btn danger',
          title: 'Remove',
          'aria-label': 'Remove item',
        },
        icon('fas fa-trash-can')
      );

      removeButton.addEventListener('click', () => {
        update(current.filter((_, itemIndex) => itemIndex !== index));
      });

      const grid = h('div', { class: 'form-grid' });
      for (const subField of field.fields) {
        grid.append(renderField(subField, item));
      }

      const headLabel = h('span', { class: 'index', text: title });
      const card = h(
        'div',
        { class: 'card-item' },
        h(
          'div',
          { class: 'card-item-head' },
          headLabel,
          h('div', { class: 'card-item-actions' }, moveButton(-1), moveButton(1), removeButton)
        ),
        grid
      );

      if (field.titleKey) {
        card.addEventListener('input', () => {
          headLabel.textContent =
            item[field.titleKey] || `${field.itemName || 'Item'} ${index + 1}`;
        });
      }

      list.append(card);
    });
  }

  render();
  return wrapper;
}

function blankItem(field) {
  const item = {};
  for (const subField of field.fields) {
    if (subField.type === 'cards') item[subField.key] = [];
    else if (subField.type === 'lines') item[subField.key] = [];
    else item[subField.key] = '';
  }
  return item;
}

/* --------------------------------------------------------------- messages */

async function loadMessages() {
  const query = state.filter === 'all' ? '' : `?status=${state.filter}`;
  const data = await api(`/api/messages${query}`);
  state.messages = data.messages;
  state.stats = data.stats;
  updateUnreadBadge();
}

function updateUnreadBadge() {
  const badge = $('#unreadBadge');
  badge.textContent = String(state.stats.unread || 0);
  badge.dataset.empty = state.stats.unread > 0 ? 'false' : 'true';
}

function bindMessageActions() {
  $('#messageFilters').addEventListener('click', async (event) => {
    const chip = event.target.closest('button[data-filter]');
    if (!chip) return;

    state.filter = chip.dataset.filter;
    for (const button of $$('#messageFilters [data-filter]')) {
      button.classList.toggle('active', button === chip);
    }
    await refreshMessages();
  });

  $('#refreshMessages').addEventListener('click', refreshMessages);
}

async function refreshMessages() {
  try {
    await loadMessages();
    renderMessages();
  } catch (error) {
    if (error.status === 401) return showLogin();
    toast(error.message, 'error');
  }
}

function renderMessages() {
  const list = $('#messagesList');
  list.replaceChildren();

  if (state.messages.length === 0) {
    list.append(
      h(
        'div',
        { class: 'empty' },
        icon('fas fa-inbox'),
        h('p', {
          text:
            state.filter === 'all'
              ? 'No messages yet. New contact form submissions appear here.'
              : `No ${state.filter} messages.`,
        })
      )
    );
    return;
  }

  for (const message of state.messages) {
    list.append(messageCard(message));
  }
}

function messageCard(message) {
  const isOpen = state.expanded.has(message.id);
  const isUnread = message.status === 'unread';

  const head = h(
    'div',
    {
      class: 'message-head',
      role: 'button',
      tabindex: '0',
      'aria-expanded': String(isOpen),
    },
    h(
      'div',
      { class: 'message-main' },
      h(
        'div',
        { class: 'message-name' },
        isUnread ? h('span', { class: 'unread-dot' }) : null,
        message.name
      ),
      h('div', { class: 'message-sub', text: message.email }),
      h('div', { class: 'message-preview', text: message.message })
    ),
    h(
      'div',
      { class: 'message-meta' },
      h('span', { class: `pill ${message.status}`, text: message.status }),
      h('span', { class: 'message-date', text: formatDate(message.createdAt) })
    )
  );

  const toggle = async () => {
    if (state.expanded.has(message.id)) {
      state.expanded.delete(message.id);
    } else {
      state.expanded.add(message.id);
      if (message.status === 'unread') {
        await setStatus(message, 'read', false);
      }
    }
    renderMessages();
  };

  head.addEventListener('click', toggle);
  head.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  });

  const card = h('div', { class: `message-card${isUnread ? ' unread' : ''}` }, head);

  if (isOpen) {
    const mailto = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
      'Re: your message to Oumar Bagayoko'
    )}`;

    const body = h(
      'div',
      { class: 'message-body' },
      h('p', { class: 'message-text', text: message.message }),
      h(
        'div',
        { class: 'message-actions' },
        h(
          'a',
          { class: 'action-link', href: mailto },
          icon('fas fa-reply'),
          'Reply by email'
        ),
        copyButton(message.email),
        message.status === 'unread'
          ? actionButton('Mark read', 'fa-envelope-open', () => setStatus(message, 'read'))
          : actionButton('Mark unread', 'fa-envelope', () => setStatus(message, 'unread')),
        message.status === 'archived'
          ? actionButton('Restore', 'fa-box-open', () => setStatus(message, 'read'))
          : actionButton('Archive', 'fa-box-archive', () => setStatus(message, 'archived')),
        h('span', { class: 'spacer' }),
        actionButton('Delete', 'fa-trash-can', () => removeMessage(message), true)
      )
    );

    card.append(body);
  }

  return card;
}

function actionButton(label, iconClass, handler, danger = false) {
  const button = h(
    'button',
    { type: 'button', class: `action-link${danger ? ' danger' : ''}` },
    icon(`fas ${iconClass}`),
    label
  );
  button.addEventListener('click', handler);
  return button;
}

function copyButton(text) {
  const button = h(
    'button',
    { type: 'button', class: 'action-link' },
    icon('fas fa-copy'),
    'Copy email'
  );
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast('Email copied');
    } catch {
      toast('Could not copy', 'error');
    }
  });
  return button;
}

async function setStatus(message, status, refresh = true) {
  try {
    await api('/api/messages', {
      method: 'PATCH',
      body: JSON.stringify({ id: message.id, status }),
    });
    message.status = status;
    if (refresh) await refreshMessages();
    else {
      state.stats.unread = Math.max(0, state.stats.unread - 1);
      updateUnreadBadge();
    }
  } catch (error) {
    if (error.status === 401) return showLogin();
    toast(error.message, 'error');
  }
}

async function removeMessage(message) {
  if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
  try {
    await api(`/api/messages?id=${message.id}`, { method: 'DELETE' });
    state.expanded.delete(message.id);
    toast('Message deleted');
    await refreshMessages();
  } catch (error) {
    if (error.status === 401) return showLogin();
    toast(error.message, 'error');
  }
}
