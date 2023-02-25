
import monsters from '../data/monsters.json' assert {type: 'json'};

export const MonsterOptions = [];
for (let ii = 0; ii < monsters.length; ii++) {
    MonsterOptions.push({value: ii, text: monsters[ii].n});
}


export const AwesomeMonster = {
    monster_key: 12,

    Name: '—',
    size: '',
    type: '—',
    alignment: '—',
    HP_full: '—',
    AC_full: '—',
    speed_full: '—',
    CR: '—',
    XP: '—',

    init: '+0',
    HP: '0',
    AC: '10',
    speed: '30',

    attributes: {
        "STR": '—',
        "DEX": '—',
        "CON": '—',
        "INT": '—',
        "WIS": '—',
        "CHA": '—'
    },

    saves: '—',
    skills: '—',
    passive_perception: 10,
    languages: '—',
    senses: '—',
    resistances: ['—', '—', '—', '—', '—'],

    traits: [],
    actions: [],
    attacks: [],
    castings: [],
    reactions: [],

    has_melee_attack: false,

    legendary_actions: [],
    legendary_attacks: [],

    fill_properties(monster_key) {

        if (monster_key === undefined) {
            return;
        }

        this.monster_key = monster_key;
        if (this.monster_key === null) {
            return;
        }

        let data = monsters[this.monster_key];
        let c = data.c;
        let s = data.s;

        this.Name = data.n;
        this.size = c[0];
        this.type = c[1];
        this.alignment = c[2];
        this.HP_full = c[3];
        this.AC_full = c[4];
        this.CR = c[6];
        this.XP = c[7];
        this.speed_full = c[5];

        this.init = c[11];
        this.HP = s[0];
        this.AC = s[1];
        this.speed = s[2];

        this.attributes = {
            "STR": c[8],
            "DEX": c[10],
            "CON": c[12],
            "INT": c[14],
            "WIS": c[16],
            "CHA": c[18]
        };

        this.saves = c[20];
        this.skills = c[21];
        this.passive_perception = c[27];
        this.languages = c[29];
        this.senses = c[28];
        this.resistances = c.slice(22, 27);

        this.traits = [];
        this.actions = [];
        this.attacks = [];
        this.castings = [];
        this.reactions = [];

        this.has_melee_attack = false,

        this.legendary_actions = [];
        this.legendary_attacks = [];

        if (c[30].length > 5) {
            let traits = JSON.parse(c[30]);
            for (let trait of traits) {
                if (trait.Name === 'Spellcasting') {
                    let text = trait.Desc;
                    this.castings.push(text);
                } else if (trait.Name === 'Innate Spellcasting') {
                    let text = trait.Desc;
                    this.castings.push(text);
                } else {
                    this.traits.push({name: trait.Name, text: trait.Desc});   
                }
            }
        }

        if (c[31].length > 5) {
            let actions = JSON.parse(c[31]);
            for (let action of actions) {
                if (action.hasOwnProperty('Type Attack')) {
                    if (action.Type === 'Melee') {
                        this.has_melee_attack = true;
                    }

                    this.attacks.push({
                        name: action.Name,
                        hit_bonus: (parseInt(action['Hit Bonus']) < 0 ? '-' : '+') + parseInt(action['Hit Bonus']),
                        range: action.Reach + ', ' +  action.Target,
                        dmg: action.Damage.replaceAll(' ', ''),
                        dmg_type: action['Damage Type']
                    });
                } else {
                    this.actions.push({name: action.Name, text: action.Desc});
                }
            }
        }

        if (c[38].length > 5) {
            let actions = JSON.parse(c[38]);
            for (let action of actions) {
                if (action.hasOwnProperty('Type Attack')) {
                    if (action.Type === 'Melee') {
                        this.has_melee_attack = true;
                    }

                    this.legendary_attacks.push({
                        name: action.Name,
                        hit_bonus: (parseInt(action['Hit Bonus']) < 0 ? '-' : '+') + parseInt(action['Hit Bonus']),
                        range: action.Reach + ', ' +  action.Target,
                        dmg: action.Damage.replaceAll(' ', ''),
                        dmg_type: action['Damage Type']
                    });
                } else {
                    this.legendary_actions.push({name: action.Name, text: action.Desc});
                }
            }
        }

        if (c[37].length > 5) {
            this.reactions = JSON.parse(c[37]);
        }
    }
}

export function AwesomeMonstssser(props = {}) {
    return {
        selected_monster_key: null,

        monster_list() {
            let monsters = [];
            for (let [monsters, ii] of monsters) {
                monsters.push({value: ii, text: monster.n});
            }

            return monsters;
        },

        loaded() {
            return (this.selected_monster_key !== null);
        },

        get Name() {
            if (this.loaded()) {
                return this._data().n;
            }

            return '';
        },

        pri_race_name() {
            if (this.loaded()) {
                return this._hero_race()['name'];
            }

            return '';
        },

        attribute(key) {
            if (this.loaded()) {
                let attr = this._hero_data('attributes')[key];
                let pri_race_attrs = this._hero_race()['attributes'];
                if (pri_race_attrs.hasOwnProperty(key)) {
                    attr += pri_race_attrs[key];
                }

                return attr;
            }

            return 10;
        },

        att_modifier(key) {
            let attr = this.attribute(key);
            let mod = Math.floor((attr-10)/2);
 
            return (mod < 0 ? '' : '+') + mod;
        },

        passive_perception() {
            if (this.loaded()) {
                return 10 + parseInt(this.att_modifier('wis'));
            }
            return '';
        },

        armor_class() {
            if (this.loaded()) {
                let dex_mod = parseInt(this.att_modifier('dex'));
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

        initiative() {
            if (this.loaded()) {
                return this.att_modifier('dex');
            }

            return '';
        },

        speed() {
            if (this.loaded()) {
                return this._hero_race()['speed'];
            }

            return '';
        },

        hit_points() {
            let HD = this.hit_dice();
            if (HD > 0) {
                HD += parseInt(this.att_modifier('con'));

                if (this.selected_hero_key === 'sorcerer_1') {
                    HD++;
                }

                return this.pri_level * HD;
            }

            return 0;
        },

        hit_dice() {
            if (this.loaded()) {
                return this._hero_class()['hit_die'];
            }

            return 0;
        },

        is_save_prof(key) {
            if (this.loaded()) {
                return this._hero_class()['proficiencies']['saves'].includes(key);
            }
            
            return false;
        },

        save_mod(key) {
            let attr_mod = this.att_modifier(key);
            if (this.is_save_prof(key)) {
                let prof_mod = parseInt(attr_mod)+2;
                attr_mod = (prof_mod < 0 ? '' : '+') + prof_mod;
            }

            return attr_mod;
        },

        skills_list() {
            let list = [];
            if (this.loaded()) {
                let hero_skills = this._hero_class()['proficiencies']['skills'];
                hero_skills = hero_skills.concat(this._hero_race()['proficiencies']['skills']);
                for (let [skill_name, mod] of Object.entries(this.skills)) {
                    let is_prof = hero_skills.includes(skill_name);
                    let attr_mod = this.att_modifier(mod.toLowerCase());
                    if (is_prof) {
                        let prof_mod = parseInt(attr_mod)+2;
                        attr_mod = (prof_mod < 0 ? '' : '+') + prof_mod;
                    }
                    
                    list.push({
                        name: skill_name,
                        mod: mod,
                        is_prof: is_prof,
                        attr_mod: attr_mod
                    });
                }
            } else {
                for (let [skill_name, mod] of Object.entries(this.skills)) {
                    list.push({
                        name: skill_name,
                        mod: mod,
                        is_prof: false,
                        attr_mod: ''
                    });
                }
            }
            
            return list;
        },


        hero_proficiencies() {
            let profs_list = '';
            if (this.loaded()) {
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

        weapons_rows() {
            let weapons = [{name: '', attk: '', dmg: ''}, {name: '', attk: '', dmg: ''}, {name: '', attk: '', dmg: ''}];
            if (this.loaded()) {
                let str_mod = this.att_modifier('str');
                let dex_mod = this.att_modifier('dex');
                let hero_weapons = this._hero_data('weapons');
                for (let ii = 0; ii < hero_weapons.length; ii++) {
                    if (weapons_data.hasOwnProperty(hero_weapons[ii])) {
                        let weapon_data = weapons_data[hero_weapons[ii]];

                        let attk_bonus = 2;
                        if (weapon_data.properties.includes("Finesse")) {
                            attk_bonus += parseInt(dex_mod);
                        } else {
                            attk_bonus += parseInt(str_mod);
                        }

                        let attk = '';
                        if (attk_bonus != 0) {
                            attk = (attk_bonus < 0 ? '' : '+') + attk_bonus;
                        }

                        let dmg = weapon_data.dmg_dice;
                        if (parseInt(str_mod) !== 0) {
                            dmg += str_mod;
                        }

                        weapons[ii] = {
                            name: weapon_data.name,
                            attk: attk,
                            dmg: dmg + " " + weapon_data.dmg_type
                        }
                    }               
                }
            }

            return weapons;
        },

        spells_list() {
            if (this.loaded()) {
                let spells = this._hero_class()['spells'];
                if (Object.keys(spells).length < 1) {
                    return '';
                }

                this.spell_slots = spells.Slots;

                let spells_list = '';
                if (spells.Cantrips.length > 0) {
                    spells_list += 'Cantrips: ' + spells.Cantrips.join(', ') + "\n\n";
                }

                if (spells['Level 1'].length > 0) {
                    spells_list += 'Level 1: ' + spells['Level 1'].join(', ') + "\n\n";
                }

                if (spells['Level 2'].length > 0) {
                    spells_list += 'Level 2: ' + spells['Level 2'].join(', ') + "\n\n";
                }


                return spells_list;
            }

            return '';
        },

        hero_gear() {
            let gear_list = '';
            if (this.loaded()) {
                for (let item of this._hero_data('equipment')) {
                    gear_list += item + "\n\n";
                }
            }

            return gear_list;
        },

        hero_traits() {
            let traits = {};
            if (this.loaded()) {
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

        hero_attacks() {
            if (!this.loaded()) {
                return {};
            }

            let attacks = {};      
        
            return attacks;
        },

        spell_attacks() {
            if (!this.loaded()) {
                return {};
            }

            let attacks = {};      
        
            return attacks;
        },

        hero_actions(type = 'bonus') {
            if (!this.loaded()) {
                return [];
            }

            //"bonus": {
            //    "Off-hand Attack": "Make one melee, brawl or ranged Attack with off-hand"
            //},

            //"reaction": {
            //    "Attack of Opportunity": "Make one melee attack"
            //}
        
            let actions = actions_data[type];

            if (type === 'free') {
                return Object.keys(actions);
            } 
            
            return actions;
        },

        hero_standard_actions(offset = 0) {
            let keys = Object.keys(this.standard_actions);
            let actions = [];
            for (let ii = offset; ii < (offset + 3); ii++) {
                let name = keys[ii];
                actions.push({
                    name: keys[ii],
                    text: this.standard_actions[keys[ii]]
                });
            }

            return actions;
        },

        _data() {
            if (this.loaded()) {
                return monsters[this.selected_monster_key];
            }

            return {};
        }
    }
}