import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CooperativeRole {
  /** True if user owns the cooperative (has role 'cooperative') */
  isCoopOwner: boolean;
  /** True if user is president/tresorier/secretaire or owner */
  isCoopAdmin: boolean;
  /** True if user is a linked member but NOT admin */
  isReadOnly: boolean;
  /** True if user is linked to a cooperative as member */
  isCoopMember: boolean;
  /** The cooperative owner's user_id (for querying data) */
  cooperativeUserId: string | null;
  /** The member's cooperative_role */
  memberRole: string | null;
  /** Loading state */
  loading: boolean;
}

export const useCooperativeRole = (): CooperativeRole => {
  const { user, primaryRole } = useAuth();
  const [state, setState] = useState<Omit<CooperativeRole, "loading">>({
    isCoopOwner: false,
    isCoopAdmin: false,
    isReadOnly: false,
    isCoopMember: false,
    cooperativeUserId: null,
    memberRole: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const check = async () => {
      // If user has cooperative role, they are the owner
      if (primaryRole === "cooperative") {
        setState({
          isCoopOwner: true,
          isCoopAdmin: true,
          isReadOnly: false,
          isCoopMember: false,
          cooperativeUserId: user.id,
          memberRole: null,
        });
        setLoading(false);
        return;
      }

      // Check if user is a linked member of a cooperative
      const { data } = await supabase
        .from("cooperative_members")
        .select("cooperative_user_id, cooperative_role, status")
        .eq("linked_user_id", user.id)
        .eq("status", "actif")
        .limit(1)
        .maybeSingle();

      if (data) {
        const adminRoles = ["president", "vice_president", "tresorier", "secretaire"];
        const isAdmin = adminRoles.includes(data.cooperative_role);
        setState({
          isCoopOwner: false,
          isCoopAdmin: isAdmin,
          isReadOnly: !isAdmin,
          isCoopMember: true,
          cooperativeUserId: data.cooperative_user_id,
          memberRole: data.cooperative_role,
        });
      } else {
        setState({
          isCoopOwner: false,
          isCoopAdmin: false,
          isReadOnly: false,
          isCoopMember: false,
          cooperativeUserId: null,
          memberRole: null,
        });
      }
      setLoading(false);
    };

    check();
  }, [user, primaryRole]);

  return { ...state, loading };
};
