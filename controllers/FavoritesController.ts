import { FavoriteItem, Group } from '@/types';
import { GroupController } from './GroupController';

export class FavoritesController {
  static getGroupFavorites(favorites: FavoriteItem[], groupId: string, groups: Group[]): FavoriteItem[] {
    const group = groups.find(g => g.id === groupId);
    if (!group) return [];

    return favorites.filter(fav => {
      // Include group-level favorites
      if (!fav.assignedTo && fav.groupId === groupId) {
        return true;
      }
      // Include personal favorites of group members
      if (fav.assignedTo) {
        return GroupController.isMemberInGroup(group, fav.assignedTo);
      }
      return false;
    });
  }

  static getMemberFavorites(favorites: FavoriteItem[], memberName: string): FavoriteItem[] {
    return favorites.filter(fav => fav.assignedTo === memberName);
  }

  static cleanupGroupLevelFavorites(favorites: FavoriteItem[], memberName: string, groupId: string): FavoriteItem[] {
    return favorites.filter(fav => {
      // Keep personal favorites (they follow the member)
      if (fav.assignedTo === memberName) return true;
      // Remove group-level favorites only if they were assigned to this member in this group
      if (!fav.assignedTo && fav.groupId === groupId) return false;
      return true;
    });
  }
}