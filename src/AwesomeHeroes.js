import base_chars from '../data/base_chars.json' assert {type: 'json'};
import pri_races from '../data/pri_races.json' assert {type: 'json'};
import pri_classes from '../data/pri_classes.json' assert {type: 'json'};
import pri_actions from '../data/pri_actions.json' assert {type: 'json'};
import weapons_data from '../data/weapons.json' assert {type: 'json'};
import spells_data from '../data/spells.json' assert {type: 'json'};


export const HeroOptions = [];
for (let [hero_key, hero] of Object.entries(pri_classes)) {
    HeroOptions.push({value: hero_key, text: hero.name});
}


export const AwesomeHero = {

    hero_key: null,
    hero_level: 1,
    prof_bonus: 2,

    attributes: {
        str: {text: "Strength", score: 10, modifier: '', is_prof: false},
        dex: {text: "Dexterity", score: 10, modifier: '', is_prof: false},
        con: {text: "Constitution", score: 10, modifier: '', is_prof: false},
        int: {text: "Intelligence", score: 10, modifier: '', is_prof: false},
        wis: {text: "Wisdom", score: 10, modifier: '', is_prof: false},
        cha: {text: "Charisma", score: 10, modifier: '', is_prof: false},
    },

    skills: {
        "Acrobatics": {type: "Dex", modifier: '', is_prof: false},
        "Animal Handling": {type: "Wis", modifier: '', is_prof: false},
        "Arcana": {type: "Int", modifier: '', is_prof: false},
        "Athletics": {type: "Str", modifier: '', is_prof: false},
        "Deception": {type: "Cha", modifier: '', is_prof: false},
        "History": {type: "Int", modifier: '', is_prof: false},
        "Insight": {type: "Wis", modifier: '', is_prof: false},
        "Intimidation": {type: "Cha", modifier: '', is_prof: false},
        "Investigation": {type: "Int", modifier: '', is_prof: false},
        "Medicine": {type: "Wis", modifier: '', is_prof: false},
        "Nature": {type: "Int", modifier: '', is_prof: false},
        "Perception": {type: "Wis", modifier: '', is_prof: false},
        "Performance": {type: "Cha", modifier: '', is_prof: false},
        "Persuasion": {type: "Cha", modifier: '', is_prof: false},
        "Religion": {type: "Int", modifier: '', is_prof: false},
        "Sleight of Hand": {type: "Dex", modifier: '', is_prof: false},
        "Stealth": {type: "Dex", modifier: '', is_prof: false},
        "Survival": {type: "Wis", modifier: '', is_prof: false},
    },

    weapons: [],

    spells: [],

    get pri_class_name () {
        if (this._is_loaded()) {
            let parts = this._hero_class()['name'].split(' ');
            return parts[1];
        }

        return '';
    },

    get pri_race_name () {
        if (this._is_loaded()) {
            return this._hero_race()['name'];
        }

        return '';
    },

    get attributes_list () {
        if (this._is_loaded()) {
            let pri_race_attrs = this._hero_race()['attributes'];
            for (let [attr, score] of Object.entries(this._hero_data('attributes'))) {
                if (pri_race_attrs.hasOwnProperty(attr)) {
                    score += pri_race_attrs[attr];
                }

                let mod = Math.floor((score-10)/2);

                this.attributes[attr].score = score;
                this.attributes[attr].modifier = (mod < 0 ? '' : '+') + mod;
            }
        }
        
        return this.attributes;
    },

    get saves_list () {
        if (this._is_loaded()) {
            let hero_saves = this._hero_class()['proficiencies']['saves'];
            for (let attr of Object.keys(this.attributes)) {
                this.attributes[attr].is_prof = hero_saves.includes(attr);
            }
        }

        return this.attributes;
    },

    get skills_list () {
        if (this._is_loaded()) {
            let hero_skills = this._hero_class()['proficiencies']['skills'];
            hero_skills = hero_skills.concat(this._hero_race()['proficiencies']['skills']);
            for (let [skill_name, skill] of Object.entries(this.skills)) {
                let is_prof = hero_skills.includes(skill_name);
                let attr_mod = this.attributes[skill.type.toLowerCase()].modifier;
                if (is_prof) {
                    let prof_mod = parseInt(attr_mod) + this.prof_bonus;
                    attr_mod = (prof_mod < 0 ? '' : '+') + prof_mod;
                }
                
                this.skills[skill_name].is_prof = is_prof;
                this.skills[skill_name].modifier = attr_mod;
            }
        } 

        return this.skills;
    },

    get passive_perception () {
        if (this._is_loaded()) {
            return 10 + parseInt(this.attributes.wis.modifier);
        }

        return '';
    },

    get hero_proficiencies () {
        let profs_list = '';
        if (this._is_loaded()) {
            let class_profs = this._hero_class()['proficiencies'];
            profs_list += "Armor: " + class_profs.armor.join(', ') + "\n\n";
            profs_list += "Weapons: " + class_profs.weapons.join(', ') + "\n\n";
            if (class_profs.tools.length > 0) {
                profs_list += "Tools: " + class_profs.tools.join(', ') + "\n\n";
            }

            profs_list += "Languages: " + this._hero_race()['languages'].join(', ') + "\n\n";
        }

        return profs_list;
    },

    get armor_class () {
        if (this._is_loaded()) {
            let dex_mod = parseInt(this.attributes.dex.modifier);
            let armor = this._hero_data('armor');
            let armor_total = armor.base_ac + armor.shield;
            if (armor.dex_max === null) {
                armor_total += dex_mod;
            } else {
                armor_total += Math.min(dex_mod, armor.dex_max);
            }

            return armor_total;
        }

        return '';
    },

    get init_bonus () {
        if (this._is_loaded()) {
            return this.attributes.dex.modifier;
        }

        return '';
    },

    get speed () {
        if (this._is_loaded()) {
            return this._hero_race()['speed'];
        }

        return '';
    },

    get hit_points () {
        if (!this._is_loaded()) {
            return '';
        }

        let HD = this._hero_class()['hit_die'];;
        HD += parseInt(this.attributes.con.modifier);

        if (this.selected_hero_key === 'sorcerer_1') {
            HD++;
        }

        return this.hero_level * HD;
    },

    get hit_dice () {
        if (!this._is_loaded()) {
            return '';
        }

        return this._hero_class()['hit_die'];;
    },

    get weapons_rows () {
        this.weapons = [{name: '', attk: '', dmg: ''}, {name: '', attk: '', dmg: ''}, {name: '', attk: '', dmg: ''}];

        let hero_weapons = [];
        let str_mod = 0;
        let dex_mod = 0;
        if (this._is_loaded()) {
            str_mod = parseInt(this.attributes.str.modifier);
            dex_mod = parseInt(this.attributes.dex.modifier);
            hero_weapons = this._hero_data('weapons');
        }

        if (hero_weapons.length > 0) {
            for (let ii = 0; ii < hero_weapons.length; ii++) {
                if (weapons_data.hasOwnProperty(hero_weapons[ii])) {
                    let weapon_data = weapons_data[hero_weapons[ii]];
    
                    let attk_bonus = this.prof_bonus;
                    if (weapon_data.properties.includes("Finesse")) {
                        attk_bonus += dex_mod;
                    } else {
                        attk_bonus += str_mod;
                    }
    
                    let attk = '';
                    if (attk_bonus != 0) {
                        attk = (attk_bonus < 0 ? '' : '+') + attk_bonus;
                    }
    
                    let dmg = weapon_data.dmg_dice;
                    if (str_mod !== 0) {
                        dmg += (str_mod < 0 ? '' : '+') + str_mod;
                    }
    
                    this.weapons[ii] = {
                        name: weapon_data.name,
                        attk: attk,
                        dmg: dmg + ' ' + weapon_data.dmg_type
                    }
                }               
            }
        }
            
        return this.weapons;
    },

    get spells_list () {
        this.spells = [[], [], []];
        if (!this._is_loaded()) {
            return '';
        }

        let spell_key = 'spells_' + this.hero_level;
        let hero_spells = this._hero_class()[spell_key];
        if (Object.keys(hero_spells).length < 1) {
            return '';
        }

        let spells_list = '';
        if (hero_spells.Cantrips.length > 0) {
            this.spells[0] = hero_spells.Cantrips;
            spells_list += 'Cantrips: ' + hero_spells.Cantrips.join(', ') + "\n\n";
        }

        if (hero_spells['Level 1'].length > 0) {
            this.spells[1] = hero_spells['Level 1'];
            spells_list += 'Level 1: ' + hero_spells['Level 1'].join(', ') + "\n\n";
        }

        if (hero_spells['Level 2'].length > 0) {
            this.spells[2] = hero_spells['Level 2'];
            spells_list += 'Level 2: ' + hero_spells['Level 2'].join(', ') + "\n\n";
        }

        return spells_list;
    },

    get gear_list () {
        if (!this._is_loaded()) {
            return '';
        }

        return this._hero_data('equipment').join("\n\n");
    },
    
    get traits_list () {
        let traits = {};
        if (this._is_loaded()) {
            traits = this._hero_race()['traits'];
            Object.assign(traits, this._hero_class()['features_1']);
            if (this.pri_level > 1) {
                Object.assign(traits, this._hero_class()['features_3']);
            }
        }

        let traits_list = '';
        if (Object.keys(traits).length > 0) {
            for (let [trait, text] of Object.entries(traits)) {
                traits_list += trait;
                if (text !== null) {
                    traits_list += ": " + text;
                }
                traits_list += "\n\n";
            }
        }

        return traits_list;
    },

    get weapons_attack_list () {
        let attacks = []; 
        for (let ii = 0; ii < this.weapons.length; ii++) {
            if (this.weapons[ii].name === '') {
                break;
            }

            attacks.push({
                label: 'Attack with ' + this.weapons[ii].name,
                attack: 'Roll 1d20' + this.weapons[ii].attk + ' vs target AC',
                damage: "Roll " + this.weapons[ii].dmg
            });
        }

        return attacks;
    },

    get spells_attack_list () {
        let attacks = []; 

        for (let ii = 2; ii >= 0; ii--) {
            if (this.spells[ii].length === 0) {
                continue;
            }

            for (let spell_name of this.spells[ii]) {
                if (weapons_data.spells.hasOwnProperty(spell_name)) {
                    let spell = weapons_data.spells[spell_name];
                    let attack_roll = this._spell_attack_instructions(spell.save);

                    attacks.push({
                        label: 'Attack with ' + spell_name,
                        range: spell.range,
                        attack: attack_roll,
                        damage: "Roll " + spell.dmg_dice + " " + spell.dmg_type
                    });
                }
            }
        }

        return attacks;
    },

    get special_action_list () {
        if (!this._is_loaded()) {
            return [];
        }

        let actions = []
        for (let [action_name, action_types] of Object.entries(pri_actions[this.hero_key]['standard'])) {
            if (action_types.length > 0) {
                for (let type_label of action_types) {
                    actions.push({
                        label: action_name + ': ' + type_label,
                    })
                }
            }   
        }

        return actions;
    },




    _is_loaded() {
        return (this.hero_key !== null);
    },

    _hero_race() {
        if (this._is_loaded()) {
            let pri_race_name = base_chars[this.hero_key]['race'];
            if (pri_races.hasOwnProperty(pri_race_name)) {
                return pri_races[pri_race_name];
            }
        }

        return null;
    },

    _hero_class() {
        if (this._is_loaded()) {
            if (pri_classes.hasOwnProperty(this.hero_key)) {
                return pri_classes[this.hero_key];
            }
        }

        return null;
    },

    _hero_data(key) {
        if (this._is_loaded()) {
            if (base_chars.hasOwnProperty(this.hero_key) && base_chars[this.hero_key].hasOwnProperty(key)) {
                return base_chars[this.hero_key][key];
            }
        }

        return null;
    },

    _spell_attack_instructions(save) {
        let attk_bonus = this.prof_bonus;
        switch (save) {
            case "dex":
                return 'Targets must make Dexterity save vs ';
            case "con":
                return 'Targets must make Constitution save vs ';
            case "str_vs_ac":
                attk_bonus += parseInt(this.attributes.str.modifier);

                return 'Roll 1d20' + (attk_bonus < 0 ? '' : '+') + attk_bonus + ' to beat AC';
            case "dex_vs_ac":
                attk_bonus += parseInt(this.attributes.dex.modifier);
                return 'Roll 1d20' + (attk_bonus < 0 ? '' : '+') + attk_bonus + ' to beat AC';
        }

        return  'Magic Missile automatically hits the target';
    }

}