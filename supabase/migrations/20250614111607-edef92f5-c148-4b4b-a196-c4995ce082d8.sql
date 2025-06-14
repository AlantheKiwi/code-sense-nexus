
-- Function to handle creating a partner record on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_partner_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Removed semicolon here
AS $$
DECLARE
  company_name_text TEXT;
  is_partner_signup_flag BOOLEAN;
  partner_slug TEXT;
  user_id_text TEXT;
BEGIN
  -- Check if 'is_partner_signup' flag is true in raw_user_meta_data
  -- Handle cases where raw_user_meta_data or the specific key might be null
  BEGIN
    is_partner_signup_flag := (NEW.raw_user_meta_data->>'is_partner_signup')::BOOLEAN;
  EXCEPTION
    WHEN others THEN
      is_partner_signup_flag := false; -- Default to false if parsing fails or key missing
  END;

  IF COALESCE(is_partner_signup_flag, false) THEN
    company_name_text := NEW.raw_user_meta_data->>'company_name';
    user_id_text := NEW.id::TEXT; -- Get user_id as text for slug generation

    IF company_name_text IS NULL OR company_name_text = '' THEN
      RAISE WARNING 'handle_new_partner_signup: company_name is missing or empty in raw_user_meta_data for user %', NEW.id;
      RETURN NEW; 
    END IF;

    -- Generate a simple slug from company name
    -- 1. Convert to lowercase
    -- 2. Replace one or more whitespace characters with a single hyphen
    -- 3. Remove any character that is not a lowercase letter, a digit, or a hyphen
    -- 4. Append a short unique part of the user_id
    partner_slug := lower(company_name_text);
    partner_slug := regexp_replace(partner_slug, '\s+', '-', 'g'); 
    partner_slug := regexp_replace(partner_slug, '[^a-z0-9-]', '', 'g'); 
    partner_slug := partner_slug || '-' || substr(user_id_text, 1, 8); -- Using 8 chars of UUID for better uniqueness

    -- Insert into partners table
    BEGIN
      INSERT INTO public.partners (user_id, company_name, slug)
      VALUES (NEW.id, company_name_text, partner_slug);
      RAISE LOG 'Partner record created for user % with company % and slug %', NEW.id, company_name_text, partner_slug;
    EXCEPTION
      WHEN unique_violation THEN
        RAISE WARNING 'handle_new_partner_signup: A partner record for user_id % or a conflicting slug % already exists. Details: %', NEW.id, partner_slug, SQLERRM;
      WHEN OTHERS THEN
        RAISE WARNING 'handle_new_partner_signup: Error inserting partner for user_id %. Company: %, Slug: %. Error: %', NEW.id, company_name_text, partner_slug, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to execute the function after a new user is inserted
-- Drop the old trigger if it exists, to avoid issues if this is re-run
DROP TRIGGER IF EXISTS on_auth_user_created_create_partner_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_create_partner_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_partner_signup();

