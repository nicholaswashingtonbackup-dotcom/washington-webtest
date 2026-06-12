/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const COMMANDS = {
  // LAYOUT
  add_section:       { params: ['style'] },
  add_columns:        { params: ['count', 'style'] },
  add_container:      { params: ['style', 'padding'] },
  add_divider:        { params: ['style'] },
  add_spacer:         { params: ['height'] },
  
  // BASIC ELEMENTS
  add_heading:        { params: ['level', 'text', 'align', 'color'] },
  add_paragraph:      { params: ['text', 'align', 'color'] },
  add_button:         { params: ['text', 'link', 'color', 'size'] },
  add_link:           { params: ['text', 'url', 'style'] },
  add_image:          { params: ['src', 'alt', 'width', 'float'] },
  add_list:           { params: ['type', 'items', 'style'] },
  add_video:          { params: ['src', 'width'] },
  add_icon:           { params: ['name', 'size', 'color'] },
  
  // FORMS
  add_input:          { params: ['type', 'placeholder', 'label'] },
  add_textarea:       { params: ['placeholder', 'label'] },
  add_select:         { params: ['options', 'label'] },
  add_checkbox:       { params: ['label'] },
  add_form:           { params: ['action', 'fields'] },
  
  // STYLING
  change_color:       { params: ['target', 'property', 'value'] },
  change_font:        { params: ['target', 'fontFamily'] },
  change_spacing:     { params: ['target', 'property', 'value'] },
  change_background:  { params: ['target', 'value'] },
  change_border:      { params: ['target', 'value'] },
  change_shadow:      { params: ['target', 'value'] },
  
  // CONTENT
  update_text:        { params: ['target', 'text'] },
  generate_content:   { params: ['target', 'type', 'context'] },
  
  // STRUCTURE
  add_navbar:         { params: ['items', 'style'] },
  add_footer:         { params: ['items', 'style'] },
  add_hero:           { params: ['headline', 'subtext', 'cta_text', 'cta_link', 'style'] },
  add_pricing:        { params: ['plans', 'style'] },
  add_testimonials:   { params: ['items', 'style'] },
  add_faq:            { params: ['items', 'style'] },
  add_team:           { params: ['members', 'style'] },
  add_gallery:        { params: ['items', 'style'] },
  add_cta:            { params: ['headline', 'text', 'button_text', 'link', 'style'] },
  add_contact:        { params: ['fields', 'style'] },
  add_blog_cards:     { params: ['items', 'style'] },
  add_features:       { params: ['items', 'style'] },
  
  // PAGE MANAGEMENT
  create_page:        { params: ['name', 'template'] },
  delete_page:        { params: ['page_id'] },
  duplicate_page:     { params: ['page_id'] },
  set_homepage:       { params: ['page_id'] },
  
  // SEO
  generate_seo:       { params: ['page_id'] },
  
  // ACCESSIBILITY
  check_accessibility:{ params: ['page_id'] },
  fix_accessibility:  { params: ['page_id', 'issues'] },
} as const;

export type CommandKey = keyof typeof COMMANDS;

export interface CanvasAction {
  command: CommandKey;
  params: Record<string, any>;
}
