// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';
import { story } from './App';
import { group, absolute, beam, note4, dot, note8, note16, staff, relative } from './lib';

// {
//   \\override NoteHead.output-attributes =
//       #'((id . 123)
//       (class . "this that")
//       (data-whatever . something))
//       <<
//         ${lilyMarkup}
//       >>
//   }

// \\layout {
//     clip-regions
//     = #(list
//         (cons
//           (make-rhythmic-location 1 0 0)
//           (make-rhythmic-location 999 0 1)))
//   }

const lick = group(
  beam(note8('d'), note8('e'), note8('f'), note8('g')),
  note4('e'),
  note8('c'),
  note8('d')
);

const theme1 = staff(
  {
    clef: 'treble',
    key: ['a', 'minor'],
    time: '4/4',
  },
  [lick]
);

const lickBass = group(absolute(beam(note4('f'), note4('g'), note4('a'), note4('d'))));

export const storyLick = story('lick', theme1);
export const storyLickBass = story('lick bass', lickBass.join(' '));

export default {
  title: 'Chords/Chords',
} as Meta;
