type Pitch = 'c' | 'd' | 'e' | 'f' | 'g' | 'a' | 'b';
type Duration = 1 | 2 | 4 | 8 | 16 | 32;
type Time = '4/4' | '3/4';

interface Note {
  type: 'note';
  pitch: Pitch;
  duration: Duration;

  sharp?: boolean;
  flat?: boolean;

  doublesharp?: boolean;
  doubleflat?: boolean;

  dot?: boolean;
  beamStart?: boolean;
  beamEnd?: boolean;
}

interface Rest {
  type: 'rest';
  duration: Duration;
}

type Item = Note | Rest;

interface GroupDefault {
  type: 'group';
  modifier: 'default';
  children: GroupChildren[];
}
interface GroupBeam {
  type: 'group';
  modifier: 'beam';
  children: GroupChildren[];
}
interface GroupAbsolute {
  type: 'group';
  modifier: 'absolute';
  children: GroupChildren[];
}
interface GroupRelative {
  type: 'group';
  modifier: 'relative';
  children: GroupChildren[];
}
interface GroupChord {
  type: 'group';
  modifier: 'chord';
  children: Note[];
}

type Group = GroupChord | GroupDefault | GroupBeam | GroupRelative | GroupAbsolute;
type GroupChildren = Group | Item;
type Modifier = Group['modifier'];

export const note = (pitch: Pitch, duration: Duration): Note => {
  return { type: 'note', pitch, duration };
};
export const note2 = (pitch: Pitch): Note => note(pitch, 2);
export const note4 = (pitch: Pitch): Note => note(pitch, 4);
export const note8 = (pitch: Pitch): Note => note(pitch, 8);
export const note16 = (pitch: Pitch): Note => note(pitch, 16);

export const sharp = (note: Note): Note => ({ ...note, sharp: true });
export const flat = (note: Note): Note => ({ ...note, flat: true });
export const doublesharp = (note: Note): Note => ({ ...note, doublesharp: true });
export const doubleflat = (note: Note): Note => ({ ...note, doubleflat: true });

type DurationString = '1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';
// Rest is a pause by given duration
export const rest = (duration: DurationString): Rest => {
  const durationStringMap: Record<DurationString, Duration> = {
    '1': 1,
    '1/2': 2,
    '1/4': 4,
    '1/8': 8,
    '1/16': 16,
    '1/32': 32,
  };
  return { type: 'rest', duration: durationStringMap[duration] };
};

export const dot = (note: Note): Note => {
  return { ...note, dot: true };
};

export const render = (group: Group): string => {
  const renderNotePitch = (note: Note): string => {
    if (note.sharp) {
      return `${note.pitch}-sharp`;
    } else if (note.flat) {
      return `${note.pitch}-flat`;
    } else if (note.doublesharp) {
      return `${note.pitch}-sharpsharp`;
    } else if (note.doubleflat) {
      return `${note.pitch}-flatflat`;
    }
    return `${note.pitch}`;
  };
  const renderNoteDot = (note: Note): string => {
    return note.dot ? `.` : '';
  };
  const renderNote = (note: Item): string => {
    const renderBeam = (note: Note): string => {
      if (note.beamStart) {
        return `(`;
      } else if (note.beamEnd) {
        return ')';
      }
      return '';
    };
    if (note.type === 'note') {
      return [
        renderNotePitch(note),
        note.duration,
        renderNoteDot(note),
        renderBeam(note),
      ].join('');
    } else if (note.type === 'rest') {
      return `r${note.duration}`;
    } else {
      throw new Error(`unexpected note type ${JSON.stringify(note)}`);
    }
  };

  const renderGroup = (group: Group) => {
    if (group.modifier === 'chord') {
      const firstNote = group.children[0];
      return `<${group.children
        .map((note) => {
          return renderNotePitch(note);
        })
        .join(' ')}>${firstNote.duration}${renderNoteDot(firstNote)}`;
    } else {
      return group.children
        .map((item) => {
          if (item.type === 'group') {
            return render(item);
          } else {
            return renderNote(item);
          }
        })
        .join(' ');
    }
  };

  if (group.modifier === 'default') {
    return `${renderGroup(group)}`;
  } else if (group.modifier === 'absolute') {
    return `\\absolute { ${renderGroup(group)} }`;
  } else if (group.modifier === 'relative') {
    return `\\relative { ${renderGroup(group)} }`;
  } else if (group.modifier === 'beam') {
    return `${renderGroup(group)}`;
  } else if (group.modifier === 'chord') {
    return `${renderGroup(group)}`;
  } else {
    throw new Error(`Group ${JSON.stringify(group)} is not supported`);
  }
};

// group without modifiers
export const group = (...children: GroupChildren[]): GroupDefault => {
  return { type: 'group', children, modifier: 'default' };
};

export const beam = (...notes: GroupChildren[]): GroupBeam => {
  const beamNotes = notes.map((note, index) => {
    const isFirstNote = index === 0;
    const isLastNote = index === notes.length - 1;
    if (isFirstNote) {
      // return `${note}(`;
      return { ...note, beamStart: true };
    } else if (isLastNote) {
      // return `${note})`;
      return { ...note, beamEnd: true };
    }
    return note;
  });
  return {
    type: 'group',
    children: beamNotes,
    modifier: 'beam',
  };
};

export const absolute = (...children: GroupChildren[]): GroupAbsolute => {
  return { type: 'group', children, modifier: 'absolute' };
};

export const relative = (...children: GroupChildren[]): GroupRelative => {
  return { type: 'group', children, modifier: 'relative' };
};

export const chord = (...notes: Note[]): GroupChord => {
  return { type: 'group', children: notes, modifier: 'chord' };
};

export const staff = (
  options: {
    clef: 'treble' | 'bass';
    time: Time;
    key: [Pitch, 'major' | 'minor'];
  },
  notes: string[]
) => {
  const [pitch, scale] = options.key;
  return `\\new Staff {
        \\clef ${options.clef}
        \\time ${options.time}
        \\key ${pitch} \\${scale}
        \\relative c' { ${notes.join(' ')} }
    }`;
};
