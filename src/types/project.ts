export type ProjectInput = {
  name: string;
  description: string;
  product_type: string;
  target_users: string;
  style_preference: string;
  reference_style?: string;
};

export type Project = ProjectInput & {
  id: string;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
};
