export const badgeMapping = {
    "Galar": {
        "1": "Badge_Galar_1_Grass Badge_Grass.png",
        "2": "Badge_Galar_2_Water Badge_Water.png",
        "3": "Badge_Galar_3_Fire Badge_Fire.png",
        "4": "Badge_Galar_4_Fighting Badge_Fighting.png",
        "5": "Badge_Galar_5_Fairy Badge_Fairy.png",
        "6": "Badge_Galar_6_Rock Badge_Rock.png",
        "7": "Badge_Galar_7_Dark Badge_Dark.png",
        "8": "Badge_Galar_8_Dragon Badge_Dragon.png"
    },
    "Hoenn": {
        "1": "Badge_Hoenn_1_Stone_Rock.png",
        "2": "Badge_Hoenn_2_Knuckle_Fighting.png",
        "3": "Badge_Hoenn_3_Dynamo_Electric.png",
        "4": "Badge_Hoenn_4_Heat_Fire.png",
        "5": "Badge_Hoenn_5_Balance_Normal.png",
        "6": "Badge_Hoenn_6_Feather_Flying.png",
        "7": "Badge_Hoenn_7_Mind_Psychic.png",
        "8": "Badge_Hoenn_8_Rain_Water.png"
    },
    "Johto": {
        "1": "Badge_Johto_1_Zephyr_Flying.png",
        "2": "Badge_Johto_2_Hive_Bug.png",
        "3": "Badge_Johto_3_Plain_Normal.png",
        "4": "Badge_Johto_4_Fog_Ghost.png",
        "5": "Badge_Johto_5_Storm_Fighting.png",
        "6": "Badge_Johto_6_Mineral_Steel.png",
        "7": "Badge_Johto_7_Glacier_Ice.png",
        "8": "Badge_Johto_8_Rising_Dragon.png"
    },
    "Kalos": {
        "1": "Badge_Kalos_1_BugBadge_Bug.png",
        "2": "Badge_Kalos_2_CliffBadge_Rock.png",
        "3": "Badge_Kalos_3_RumbleBadge_Fighting.png",
        "4": "Badge_Kalos_4_PlantBadge_Grass.png",
        "5": "Badge_Kalos_5_VoltageBadge_Electric.png",
        "6": "Badge_Kalos_6_FairyBadge_Fairy.png",
        "7": "Badge_Kalos_7_PsychicBadge_Psychic.png",
        "8": "Badge_Kalos_8_IcebergBadge_Ice.png"
    },
    "Kanto": {
        "1": "Badge_Kanto_1_Boulder_Rock.png",
        "2": "Badge_Kanto_2_Cascade_Water.png",
        "3": "Badge_Kanto_3_Thunder_Electric.png",
        "4": "Badge_Kanto_4_Rainbow_Grass.png",
        "5": "Badge_Kanto_5_Marsh_Psychic.png",
        "6": "Badge_Kanto_6_Soul_Poison.png",
        "7": "Badge_Kanto_7_Volcano_Fire.png",
        "8": "Badge_Kanto_8_Earth_Ground.png"
    },
    "Paldea": {
        "1": "Badge_Paldea_1_Bug Badge_Bug.png",
        "2": "Badge_Paldea_2_Grass Badge_Grass.png",
        "3": "Badge_Paldea_3_Electric Badge_Electric.png",
        "4": "Badge_Paldea_4_Water Badge_Water.png",
        "5": "Badge_Paldea_5_Normal Badge_Normal.png",
        "6": "Badge_Paldea_6_Ghost Badge_Ghost.png",
        "7": "Badge_Paldea_7_Psychic Badge_Psychic.png",
        "8": "Badge_Paldea_8_Ice Badge_Ice.png"
    },
    "Sinnoh": {
        "1": "Badge_Sinnoh_1_Coal_Rock.png",
        "2": "Badge_Sinnoh_2_Forest_Grass.png",
        "3": "Badge_Sinnoh_3_Cobble_Fighting.png",
        "4": "Badge_Sinnoh_4_Fen_Water.png",
        "5": "Badge_Sinnoh_5_Relic_Ghost.png",
        "6": "Badge_Sinnoh_6_Mine_Steel.png",
        "7": "Badge_Sinnoh_7_Icicle_Ice.png",
        "8": "Badge_Sinnoh_8_Beacon_Electric.png"
    },
    "Unova1": {
        "1": "Badge_Unova1_1_TrioBadge_mix.png",
        "2": "Badge_Unova1_2_BasicBadge_Normal.png",
        "3": "Badge_Unova1_3_InsectBadge_Bug.png",
        "4": "Badge_Unova1_4_BoltBadge_Electric.png",
        "5": "Badge_Unova1_5_QuakeBadge_Ground.png",
        "6": "Badge_Unova1_6_JetBadge_Flying.png",
        "7": "Badge_Unova1_7_FreezeBadge_Ice.png",
        "8": "Badge_Unova1_8_LegendBadge_Dragon.png"
    },
    "Unova2": {
        "1": "Badge_Unova2_1_BasicBadge_Normal.png",
        "2": "Badge_Unova2_2_ToxicBadge_Poison.png",
        "3": "Badge_Unova2_3_InsectBadge_Bug.png",
        "4": "Badge_Unova2_4_BoltBadge_Electric.png",
        "5": "Badge_Unova2_5_QuakeBadge_Ground.png",
        "6": "Badge_Unova2_6_JetBadge_Flying.png",
        "7": "Badge_Unova2_7_LegendBadge_Dragon.png",
        "8": "Badge_Unova2_8_WaveBadge_Water.png"
    }
};

export function getBadgeFileName(region, number, customBadgeMapping) {
    if (region === 'Unova') region = 'Unova2';

    if (region === 'Johto' && number > 8) {
        region = 'Kanto';
        number = number - 8;
    }

    const mapping = customBadgeMapping || badgeMapping;
    if (mapping[region] && mapping[region][number]) {
        return mapping[region][number];
    }
    // Fallback if mapping not found, though ideally we won't hit this
    return `Badge_${region}_${number}.png`;
};
