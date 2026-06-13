/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMANDS = {
  // DESIGN
  add_block: { params: ['type', 'template'] },
  remove_block: { params: ['block_id'] },
  move_block: { params: ['block_id', 'direction'] },
  duplicate_block: { params: ['block_id'] },
  update_style: { params: ['target', 'property', 'value', 'changes'] },
  update_content: { params: ['target', 'content'] },
  reorder_blocks: { params: ['block_ids'] },
  set_background: { params: ['value'] },
  set_font: { params: ['fontFamily'] },
  set_animation: { params: ['target', 'type'] },

  // MEDIA
  upload_asset: { params: ['file_name', 'media_type'] },
  delete_asset: { params: ['asset_id'] },
  tag_asset: { params: ['asset_id', 'tags'] },
  move_asset: { params: ['asset_id', 'folder'] },
  set_logo: { params: ['asset_id'] },
  set_favicon: { params: ['asset_id'] },
  replace_asset: { params: ['asset_id', 'new_url'] },

  // GALLERY
  set_gallery_layout: { params: ['block_id', 'layout'] },
  set_gallery_columns: { params: ['block_id', 'columns'] },
  set_gallery_filter: { params: ['block_id', 'filter'] },
  reorder_gallery_items: { params: ['block_id', 'items'] },

  // PAGE
  set_page_title: { params: ['title'] },
  set_meta_description: { params: ['description'] },
  set_navbar: { params: ['items'] },
  set_footer: { params: ['items'] },
  add_nav_link: { params: ['text', 'url'] },
  remove_nav_link: { params: ['text'] },

  // EXPORT
  export_html: { params: ['path'] },
  export_react: { params: ['path'] },
  export_nextjs: { params: ['path'] },
  export_vue: { params: ['path'] },
  export_to_folder: { params: ['path'] },

  // VOICE
  start_voice_session: { params: ['session_id'] },
  end_voice_session: { params: [] },
  set_voice_context: { params: ['context'] },

  // LLM
  set_provider: { params: ['provider'] },
  set_model: { params: ['model'] },
  set_api_key: { params: ['key'] },
  test_connection: { params: [] },

  // STATE (GETTERS)
  get_canvas_state: { params: [] },
  get_media_list: { params: [] },
  get_active_selection: { params: [] },
  get_project_info: { params: [] },
  get_voice_status: { params: [] },

  // GENERATE
  generate_headline: { params: ['prompt'] },
  generate_description: { params: ['prompt'] },
  generate_image: { params: ['prompt'] },
  generate_video: { params: ['prompt'] },
  generate_code: { params: ['prompt'] },
} as const;

export type CommandKey = keyof typeof COMMANDS;

export interface CanvasAction {
  command: CommandKey;
  params: Record<string, any>;
}
