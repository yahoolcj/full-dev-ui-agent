export type DesignSystemInput = {
  brand_keywords: string[];
  color_palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    style: string;
    recommended_fonts: string[];
  };
  ui_style: string;
  icon_style: string;
  illustration_style: string;
  layout_rules: string[];
  component_rules: string[];
  negative_rules: string[];
  prompt_template: string;
};

export type DesignSystem = DesignSystemInput & {
  id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
};
