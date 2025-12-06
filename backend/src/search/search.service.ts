// backend/src/search/search.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Entities --------------------------------------------------------------
import { Profile } from '../database/entities/profile.entity';
import { User } from '../database/entities/user.entity';

// ====================================================================
// # PROFILE PREVIEW INTERFACE
// ====================================================================
//
// Represents a lightweight, search-optimized result describing a user.
// Returned by search queries rather than the full Profile entity.
//

export interface ProfilePreview {
  id: string;
  name: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  distanceMiles: number;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ====================================================================
  // # PRIVATE HELPERS — AGE CALCULATION
  // ====================================================================

  /**
   * Calculates a user's age from their birthday (YYYY-MM-DD string).
   */
  private calculateAge(birthday: string): number {
    const b = new Date(birthday);
    const diff = Date.now() - b.getTime();
    return new Date(diff).getUTCFullYear() - 1970;
  }

  // ====================================================================
  // # PRIVATE HELPERS — HAVERSINE DISTANCE
  // ====================================================================

  /**
   * Calculates geographic distance between two coordinates in miles
   * using the Haversine formula.
   */
  private haversineMiles(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 3958.8; // Earth radius in miles
    const toRad = (x: number) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

    return R * 2 * Math.asin(Math.sqrt(a));
  }

  // ====================================================================
  // # SEARCH USERS BY NAME (FILTERED BY DISTANCE)
  // ====================================================================

  /**
   * Searches profiles by first name, constrained by distance from
   * the requesting user.
   *
   * Returns lightweight previews sorted by proximity.
   */
  async searchByName(
    uid: string,
    firstName: string,
    radiusMiles: number,
  ): Promise<ProfilePreview[]> {
    const user = await this.userRepo.findOne({ where: { uid } });
    if (!user || !user.latitude || !user.longitude) return [];

    // Find all profiles with a matching first name
    const profiles = await this.profileRepo.find({
      where: { name: firstName },
    });

    const results: ProfilePreview[] = [];

    for (const p of profiles) {
      const targetUser = await this.userRepo.findOne({
        where: { uid: p.userUid },
      });

      // Must have valid location
      if (!targetUser || !targetUser.latitude || !targetUser.longitude)
        continue;

      // Compute distance
      const distance = this.haversineMiles(
        user.latitude,
        user.longitude,
        targetUser.latitude,
        targetUser.longitude,
      );

      if (distance > radiusMiles) continue;

      // Build preview object
      results.push({
        id: p.id,
        name: p.name,
        age: this.calculateAge(p.birthday),
        bio: p.bio,
        photoUrl: p.photos?.[0] ?? null,
        distanceMiles: distance,
      });
    }

    // Return sorted by nearest
    return results.sort((a, b) => a.distanceMiles - b.distanceMiles);
  }
}
