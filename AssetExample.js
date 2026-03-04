import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Image, 
  FlatList, Animated, Easing, Dimensions, SafeAreaView, Modal, ScrollView, Linking, Alert 
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1550291652-6ea9114a47b1?w=200';

const imageCache = {};

const MEDALS = {
  1: { name: 'Bronze Pick', icon: 'musical-note', color: '#cd7f32', desc: "You've taken your first steps." },
  2: { name: 'Silver String', icon: 'flame', color: '#C0C0C0', desc: 'You own the campfire!' },
  3: { name: 'Golden Guitar', icon: 'star', color: '#FFD700', desc: 'A true troubadour.' },
  4: { name: 'Platinum Amp', icon: 'flash', color: '#E5E4E2', desc: 'Ready for the stage!' },
  5: { name: 'Diamond Stage', icon: 'diamond', color: '#b9f2ff', desc: 'Total dominance.' }
};

const CoverImage = ({ artist, title, style }) => {
  const [imgUri, setImgUri] = useState(DEFAULT_IMAGE); 
  useEffect(() => {
    let isMounted = true;
    const query = encodeURIComponent(`${artist} ${title}`);
    
    if (imageCache[query]) {
      setImgUri(imageCache[query]);
      return;
    }

    const fetchCover = async () => {
      try {
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await response.json();
        if (isMounted && data.results && data.results.length > 0) {
          const highResUrl = data.results[0].artworkUrl100.replace('100x100bb', '400x400bb');
          imageCache[query] = highResUrl;
          setImgUri(highResUrl);
        }
      } catch (error) {}
    };
    fetchCover();
    return () => { isMounted = false; };
  }, [artist, title]);
  return <Image source={{ uri: imgUri }} style={style} />;
};

// --- DATABASE IN ENGLISH ---
const songDb = [
  // LEVEL 1
  { id: '1', title: 'Achy Breaky Heart', artist: 'Billy Ray Cyrus', genre: 'Country', reqLevel: 1, chords: ['C', 'G'], capo: 0, bpm: 120, strumming: '↓  ↓  ↓  ↓', instructions: 'Only TWO chords! Perfect start.', lyricsWithChords: 'Don\'t tell my [C] heart, my achy breaky [G] heart' },
  { id: '2', title: 'Molly\'s Lips', artist: 'Nirvana', genre: 'Rock', reqLevel: 1, chords: ['G', 'C'], capo: 0, bpm: 162, strumming: '↓  ↓  ↓  ↓', instructions: 'Pure punk energy! Just straight downstrokes.', lyricsWithChords: '[G] She said, she\'d [C] take me anywhere' },
  { id: '3', title: 'Love Me Do', artist: 'The Beatles', genre: 'Pop', reqLevel: 1, chords: ['G', 'C', 'D'], capo: 0, bpm: 148, strumming: '↓  ↓  ↓  ↑  ↓', instructions: 'Classic with only 3 chords.', lyricsWithChords: '[G] Love, love me [C] do' },
  { id: '4', title: 'Three Little Birds', artist: 'Bob Marley', genre: 'Reggae', reqLevel: 1, chords: ['A', 'D', 'E'], capo: 0, bpm: 74, strumming: '↓  ↑  ↓  ↑', instructions: 'Classic reggae rhythm.', lyricsWithChords: 'Don\'t [A] worry, about a thing' },
  { id: '5', title: 'I Wanna Be There', artist: 'Blessed Union of Souls', genre: 'Pop', reqLevel: 1, chords: ['G', 'C', 'D'], capo: 0, bpm: 90, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Very simple 3-chord song.', lyricsWithChords: '[G] I wanna be [C] there for you [D]' },
  { id: '6', title: 'A Horse With No Name', artist: 'America', genre: 'Folk', reqLevel: 1, chords: ['Em', 'D'], capo: 0, bpm: 124, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'Just two super simple chords.', lyricsWithChords: 'I\'ve been [Em] through the desert on a horse with no [D] name' },
  { id: '7', title: 'Wild Thing', artist: 'The Troggs', genre: 'Rock', reqLevel: 1, chords: ['A', 'D', 'E'], capo: 0, bpm: 100, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'The ultimate garage rock song.', lyricsWithChords: '[A] Wild thing [D] [E] you make my heart sing' },
  { id: '8', title: 'What I Got', artist: 'Sublime', genre: 'Rock', reqLevel: 1, chords: ['D', 'G'], capo: 0, bpm: 96, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'D and G straight through the whole song.', lyricsWithChords: '[D] Early in the morning [G]' },
  { id: '9', title: 'Fire on the Mountain', artist: 'Grateful Dead', genre: 'Rock', reqLevel: 1, chords: ['B', 'A'], capo: 0, bpm: 90, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Nice jam band groove.', lyricsWithChords: '[B] Fire on the [A] mountain' },
  { id: '10', title: 'About a Girl', artist: 'Nirvana', genre: 'Rock', reqLevel: 1, chords: ['Em', 'G'], capo: 0, bpm: 130, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'Switch between Em and G.', lyricsWithChords: '[Em] I need an easy [G] friend' },
  
  // LEVEL 2
  { id: '11', title: 'Riptide', artist: 'Vance Joy', genre: 'Pop', reqLevel: 2, chords: ['Am', 'G', 'C'], capo: 1, bpm: 104, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'A fast pop strum.', lyricsWithChords: 'Lady, [Am] running down to the [G] riptide [C]' },
  { id: '12', title: 'Shake It Off', artist: 'Taylor Swift', genre: 'Pop', reqLevel: 2, chords: ['Am', 'C', 'G'], capo: 0, bpm: 160, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Keep your wrist loose for this fast tempo.', lyricsWithChords: '[Am] I stay out too late\n[C] Got nothing in my brain' },
  { id: '13', title: 'Brown Eyed Girl', artist: 'Van Morrison', genre: 'Rock', reqLevel: 2, chords: ['G', 'C', 'D', 'Em'], capo: 0, bpm: 150, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Everyone loves this at festivals.', lyricsWithChords: '[G] Hey, where did [C] we go [G] days when the [D] rains came' },
  { id: '14', title: 'Sweet Home Alabama', artist: 'Lynyrd Skynyrd', genre: 'Rock', reqLevel: 2, chords: ['D', 'C', 'G'], capo: 0, bpm: 98, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'The ultimate 3-chord rock.', lyricsWithChords: '[D] Sweet [C] home Ala-[G]bama' },
  { id: '15', title: 'Bad Moon Rising', artist: 'CCR', genre: 'Rock', reqLevel: 2, chords: ['D', 'A', 'G'], capo: 0, bpm: 178, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Play fast and with lots of energy.', lyricsWithChords: 'I [D] see the [A] bad [G] moon [D] rising' },
  { id: '16', title: 'The Joker', artist: 'Steve Miller Band', genre: 'Rock', reqLevel: 2, chords: ['G', 'C', 'D'], capo: 0, bpm: 82, strumming: '↓  ↓  ↑  ↓  ↑', instructions: 'Groovy rock.', lyricsWithChords: 'I\'m a [G] joker, I\'m a [C] smoker [D]' },
  { id: '17', title: 'All The Small Things', artist: 'Blink 182', genre: 'Rock', reqLevel: 2, chords: ['C', 'G'], capo: 0, bpm: 148, strumming: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓', instructions: 'Straight powerchords and lots of downstrokes.', lyricsWithChords: '[C] All the small things, [G] true care truth brings' },
  { id: '18', title: 'Chasing Cars', artist: 'Snow Patrol', genre: 'Rock', reqLevel: 2, chords: ['A', 'E', 'D'], capo: 0, bpm: 104, strumming: '↓  ↓  ↓  ↓', instructions: 'Let the chords ring out long.', lyricsWithChords: '[A] If I lay here, [E] if I just lay here [D]' },
  { id: '19', title: 'Learning To Fly', artist: 'Tom Petty', genre: 'Rock', reqLevel: 2, chords: ['F', 'C', 'Am', 'G'], capo: 0, bpm: 116, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Classic Petty rhythm.', lyricsWithChords: '[F] I\'m learning to [C] fly [Am] [G]' },
  { id: '20', title: 'Ho Hey', artist: 'The Lumineers', genre: 'Folk', reqLevel: 2, chords: ['F', 'C', 'Am', 'G'], capo: 0, bpm: 80, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Shout HO and HEY on the beats.', lyricsWithChords: '(Ho) [F] [C] (Hey) [F] [C]' },

  // LEVEL 3
  { id: '21', title: 'Wonderwall', artist: 'Oasis', genre: 'Rock', reqLevel: 3, chords: ['Em', 'G', 'D', 'A'], capo: 2, bpm: 87, strumming: '↓   ↓  ↑  ↑  ↓  ↓  ↑', instructions: 'Leave your ring and pinky fingers on fret 3!', lyricsWithChords: '[Em] Today is [G] gonna be the day' },
  { id: '22', title: 'Run Around', artist: 'Blues Traveler', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'Am', 'D'], capo: 0, bpm: 152, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: '4 chords in a fast and happy tempo.', lyricsWithChords: '[G] But you [C] run around, [Am] run around [D]' },
  { id: '23', title: 'Good Riddance', artist: 'Green Day', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'D', 'Em'], capo: 0, bpm: 94, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Arpeggio or fast strumming.', lyricsWithChords: 'It\'s [G] something unpredictable but [C] in the end it\'s [D] right' },
  { id: '24', title: 'Mother', artist: 'Pink Floyd', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'D'], capo: 0, bpm: 120, strumming: '↓  ↓  ↓  ↑  ↓', instructions: 'Classic Floyd.', lyricsWithChords: '[G] Mother do you think they\'ll drop the [C] bomb' },
  { id: '25', title: 'Summer of \'69', artist: 'Bryan Adams', genre: 'Rock', reqLevel: 3, chords: ['D', 'A', 'G'], capo: 0, bpm: 138, strumming: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓', instructions: 'Straight rock downstrokes!', lyricsWithChords: '[D] I got my first real six string [A]' },
  { id: '26', title: 'Mr. Jones', artist: 'Counting Crows', genre: 'Rock', reqLevel: 3, chords: ['Am', 'F', 'D', 'G', 'C'], capo: 0, bpm: 142, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Requires slightly faster chord changes.', lyricsWithChords: '[Am] Mr. [F] Jones and me [D] [G]' },
  { id: '27', title: 'Stand By Me', artist: 'Ben E. King', genre: 'R&B', reqLevel: 3, chords: ['C', 'Am', 'F', 'G'], capo: 0, bpm: 118, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Standard progression.', lyricsWithChords: 'Oh [C] stand by me, oh [Am] stand by me' },
  { id: '28', title: 'Buddy Holly', artist: 'Weezer', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'D'], capo: 0, bpm: 120, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Nerdy and heavy pop-rock.', lyricsWithChords: '[G] What\'s with these [C] homies [D] dissing my girl' },
  { id: '29', title: 'Small Town', artist: 'John Mellencamp', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'D'], capo: 0, bpm: 120, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Classic heartland rock.', lyricsWithChords: 'Well I was [G] born in a [C] small town [D]' },
  { id: '30', title: 'Every Rose Has its Thorn', artist: 'Poison', genre: 'Rock', reqLevel: 3, chords: ['G', 'C', 'D'], capo: 0, bpm: 70, strumming: '↓  ↓  ↓  ↑', instructions: 'Classic rock ballad.', lyricsWithChords: '[G] Every rose has its [C] thorn [D]' },

  // LEVEL 4
  { id: '31', title: 'What\'s Up', artist: '4 Non Blondes', genre: 'Rock', reqLevel: 4, chords: ['E', 'Am', 'G', 'D', 'B'], capo: 0, bpm: 134, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Awesome song for karaoke!', lyricsWithChords: 'And I say [E] hey, yeah, yeah, hey [Am] hey, yeah, yeah' },
  { id: '32', title: 'Wild Horses', artist: 'The Rolling Stones', genre: 'Rock', reqLevel: 4, chords: ['Am', 'G', 'C', 'D'], capo: 0, bpm: 140, strumming: '↓  ↓  ↓  ↑  ↓', instructions: 'Slow and emotional.', lyricsWithChords: '[Am] Wild [G] horses [C] couldn\'t drag me [D] away' },
  { id: '33', title: 'Disarm', artist: 'Smashing Pumpkins', genre: 'Rock', reqLevel: 4, chords: ['Em', 'C', 'G', 'D'], capo: 0, bpm: 130, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Acoustic grunge at its best.', lyricsWithChords: '[Em] Disarm you [C] with a [G] smile [D]' },
  { id: '34', title: 'Closing Time', artist: 'Semisonic', genre: 'Rock', reqLevel: 4, chords: ['G', 'D', 'Am', 'C'], capo: 0, bpm: 90, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Same four chords straight through the whole song.', lyricsWithChords: '[G] Closing [D] time [Am] [C]' },
  { id: '35', title: 'I Ran', artist: 'Flock of Seagulls', genre: 'Pop', reqLevel: 4, chords: ['Am', 'G', 'F'], capo: 0, bpm: 145, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: '80s classic.', lyricsWithChords: '[Am] I walked along the avenue [G] [F]' },
  { id: '36', title: 'I Walk The Line', artist: 'Johnny Cash', genre: 'Country', reqLevel: 4, chords: ['E', 'A', 'D'], capo: 0, bpm: 104, strumming: '↓  ↑  ↓  ↑', instructions: 'Boom-Chicka-Boom rhythm.', lyricsWithChords: 'I keep a [E] close watch on this heart of [A] mine' },
  { id: '37', title: 'Ain\'t No Sunshine', artist: 'Bill Withers', genre: 'R&B', reqLevel: 4, chords: ['Am', 'Em', 'G', 'D'], capo: 0, bpm: 78, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Emotional and slow.', lyricsWithChords: '[Am] Ain\'t no sunshine when she\'s [Em] gone [G]' },
  { id: '38', title: 'Stay With Me', artist: 'Sam Smith', genre: 'Pop', reqLevel: 4, chords: ['Am', 'F', 'C'], capo: 0, bpm: 84, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Lots of soul and feeling.', lyricsWithChords: 'Oh won\'t you [Am] stay [F] with [C] me' },
  { id: '39', title: 'Creep', artist: 'Radiohead', genre: 'Rock', reqLevel: 4, chords: ['G', 'B', 'C'], capo: 0, bpm: 92, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Epic and massive soundscape.', lyricsWithChords: 'But I\'m a [G] creep, I\'m a [B] weirdo [C]' },
  { id: '40', title: 'Free Fallin', artist: 'Tom Petty', genre: 'Rock', reqLevel: 4, chords: ['D', 'A', 'E'], capo: 0, bpm: 84, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Plenty of space between chords.', lyricsWithChords: 'And I\'m [D] free [A], free [E] fallin\'' },

  // LEVEL 5 (PREMIUM REQUIRED)
  { id: '41', title: 'Hotel California', artist: 'The Eagles', genre: 'Rock', reqLevel: 5, chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em'], capo: 2, bpm: 74, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Many difficult chords in a row!', lyricsWithChords: 'On a [Bm] dark desert highway, [F#] cool wind in my hair' },
  { id: '42', title: 'Stairway to Heaven', artist: 'Led Zeppelin', genre: 'Rock', reqLevel: 5, chords: ['Am', 'E', 'C', 'D', 'F', 'G'], capo: 0, bpm: 82, strumming: 'Fingerpicking', instructions: 'Precision is key.', lyricsWithChords: 'There\'s a [Am] lady who\'s [E] sure all that [C] glitters is [D] gold' },
  { id: '43', title: 'Comfortably Numb', artist: 'Pink Floyd', genre: 'Rock', reqLevel: 5, chords: ['Bm', 'A', 'G', 'Em', 'D', 'C'], capo: 0, bpm: 72, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Progressive rock masterpiece.', lyricsWithChords: '[Bm] Hello? Is there anybody [A] in there?' },
  { id: '44', title: 'Seven Turns', artist: 'Allman Brothers', genre: 'Rock', reqLevel: 5, chords: ['C', 'G', 'Em', 'D'], capo: 0, bpm: 120, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Southern rock at its best.', lyricsWithChords: '[C] Seven turns on the [G] highway' },
  { id: '45', title: '500 Miles', artist: 'The Proclaimers', genre: 'Pop', reqLevel: 5, chords: ['E', 'A', 'B'], capo: 0, bpm: 132, strumming: '↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓', instructions: 'Play short "Staccato" strokes.', lyricsWithChords: 'But I would [E] walk 500 miles [A] [B]' },
  { id: '46', title: '3 AM', artist: 'Matchbox Twenty', genre: 'Rock', reqLevel: 5, chords: ['G', 'C', 'D'], capo: 0, bpm: 108, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Classic 90s rock.', lyricsWithChords: '[G] And she says baby [C] [D]' },
  { id: '47', title: 'Simple Man', artist: 'Lynyrd Skynyrd', genre: 'Rock', reqLevel: 5, chords: ['C', 'G', 'Am'], capo: 0, bpm: 60, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Heavy and slow.', lyricsWithChords: '[C] Mama [G] told me when I was [Am] young' },
  { id: '48', title: 'Sympathy for the Devil', artist: 'The Rolling Stones', genre: 'Rock', reqLevel: 5, chords: ['E', 'D', 'A'], capo: 0, bpm: 114, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Great groove in this classic.', lyricsWithChords: 'Please allow me to [E] introduce myself [D]' },
  { id: '49', title: 'Landslide', artist: 'Fleetwood Mac', genre: 'Pop', reqLevel: 5, chords: ['C', 'G', 'Am'], capo: 3, bpm: 80, strumming: 'Travis Picking', instructions: 'Requires advanced fingerpicking.', lyricsWithChords: 'I took my [C] love, I took it [G] down [Am]' },
  { id: '50', title: 'With or Without You', artist: 'U2', genre: 'Rock', reqLevel: 5, chords: ['D', 'A', 'Bm', 'G'], capo: 0, bpm: 110, strumming: '↓  ↓  ↑  ↑  ↓  ↑', instructions: 'Same four chords through the whole song.', lyricsWithChords: '[D] See the stone set in your [A] eyes [Bm] [G]' }
];

const AVAILABLE_CHORDS = ['G', 'C', 'D', 'Am', 'Em', 'A', 'E', 'F', 'B', 'Bm', 'F#'];

export default function ChordSpinApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [detectedChord, setDetectedChord] = useState('Listening...');
  const [filteredSongs, setFilteredSongs] = useState(songDb);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const [selectedSong, setSelectedSong] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chordFeedback, setChordFeedback] = useState('Waiting...');

  const [isPremium, setIsPremium] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelUpModalVisible, setLevelUpModalVisible] = useState(false);
  const [completedSongs, setCompletedSongs] = useState([]);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync().catch(()=>{}); } : undefined;
  }, [sound]);

  useEffect(() => {
    const mockAudioListener = setInterval(() => {
      const randomChord = AVAILABLE_CHORDS[Math.floor(Math.random() * AVAILABLE_CHORDS.length)];
      setDetectedChord(randomChord);
      
      if (modalVisible && selectedSong && isPlaying && isPremium) {
        setChordFeedback(selectedSong.chords.includes(randomChord) ? 'CORRECT CHORD!' : 'WRONG CHORD');
      }
    }, 2000);
    return () => clearInterval(mockAudioListener);
  }, [modalVisible, selectedSong, isPlaying, isPremium]);

  async function playSound(audioUrl) {
    try {
      if (!isPremium) {
        setPaywallVisible(true);
        return;
      }
      if (!audioUrl) return;

      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        setChordFeedback('Waiting...');
        return;
      }
      
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
    }
  }

  const completeLesson = () => {
    if (completedSongs.includes(selectedSong.id)) return;

    const xpNeeded = level * 100;
    const xpGained = 20; 
    let newXp = xp + xpGained;

    setCompletedSongs([...completedSongs, selectedSong.id]);
    closeSongLesson(); 

    setTimeout(() => {
        if (newXp >= xpNeeded) {
          if (!isPremium && level >= 4) {
            setPaywallVisible(true);
            return; 
          }
          setLevel(prev => prev + 1);
          setXp(newXp - xpNeeded); 
          setLevelUpModalVisible(true); 
        } else {
          setXp(newXp);
        }
    }, 500);
  };

  const getLevelName = (lvl) => {
    if (lvl === 1) return 'Beginner';
    if (lvl === 2) return 'Campfire Legend';
    if (lvl === 3) return 'Troubadour';
    if (lvl === 4) return 'Rockstar';
    return `Master`;
  };

  const spinTheWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    spinValue.setValue(0);
    
    const availableSongs = songDb.filter(s => s.reqLevel <= level);
    const winnerIndex = Math.floor(Math.random() * availableSongs.length);
    const winner = availableSongs[winnerIndex];
    
    Animated.timing(spinValue, { toValue: 1800 + Math.random() * 360, duration: 4000, easing: Easing.out(Easing.cubic), useNativeDriver: true })
    .start(() => { 
        setIsSpinning(false); 
        setTimeout(() => openSongLesson(winner), 200); 
    });
  };
  const spinAnimation = spinValue.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  const handleChordFilter = (chord) => {
    setDetectedChord(chord);
    setFilteredSongs(songDb.filter(s => s.chords.includes(chord)));
  };

  const openSongLesson = (song) => { 
    if (song.reqLevel > level) {
      Alert.alert("Song is locked", `Requires Level ${song.reqLevel}. You are Level ${level}. Play more songs!`);
      return;
    }
    setSelectedSong(song); 
    setModalVisible(true); 
    setChordFeedback('Waiting...'); 
  };
  
  const closeSongLesson = () => { 
      setModalVisible(false); 
      setIsPlaying(false);
      if (sound) { 
        sound.unloadAsync().catch(()=>{}); 
        setSound(null); 
      }
  };
  
  const openYouTube = (song) => { 
    const fallbackQuery = encodeURIComponent(`${song.title} ${song.artist} guitar tutorial`);
    Linking.openURL(`https://www.youtube.com/results?search_query=${fallbackQuery}`).catch(()=>{}); 
  };

  const renderLyricsWithChords = (lyrics) => {
    if (!lyrics) return null;
    return lyrics.split('\n').map((line, index) => {
      if (!line) return <View key={index} style={{height: 15}} />; 
      const parts = line.split(/(\[[^\]]+\])/g);
      return (
        <Text key={index} style={styles.lyricLine}>
          {parts.map((part, i) => part.startsWith('[') && part.endsWith(']') ? 
            <Text key={i} style={styles.lyricChord}>{part.replace(/\[|\]/g, '')} </Text> : 
            <Text key={i} style={styles.lyricText}>{part}</Text>
          )}
        </Text>
      );
    });
  };

  const renderHomeScreen = () => {
    const xpNeeded = level * 100;
    const progressPercent = (xp / xpNeeded) * 100;
    const unlockedMedals = Object.keys(MEDALS).filter(key => parseInt(key) <= level);

    return (
      <View style={styles.screenContainer}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        
        <View style={styles.xpContainer}>
          <View style={styles.xpHeader}>
            <Text style={styles.levelTitle}>Level {level}: <Text style={{color: MEDALS[level] ? MEDALS[level].color : '#FFF'}}>{MEDALS[level] ? MEDALS[level].name : `Master`}</Text></Text>
            <Text style={styles.xpText}>{xp} / {xpNeeded} XP</Text>
          </View>
          <View style={styles.xpBarBackground}>
            <View style={[styles.xpBarFill, { width: `${progressPercent}%` }]} />
          </View>
          {!isPremium && level < 4 && <Text style={styles.premiumHintSmall}>Level 5 and above requires Premium.</Text>}
        </View>

        <Text style={styles.sectionTitle}>Your Trophy Cabinet:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medalScroll}>
          {unlockedMedals.map(key => {
            const medal = MEDALS[key];
            return (
              <View key={key} style={styles.medalCard}>
                <Ionicons name={medal.icon} size={36} color={medal.color} />
                <Text style={styles.medalName}>{medal.name}</Text>
                <Text style={styles.medalLevel}>Level {key}</Text>
              </View>
            );
          })}
          {MEDALS[level + 1] && (
            <View style={[styles.medalCard, {opacity: 0.4}]}>
              <Ionicons name="lock-closed" size={36} color="#555" />
              <Text style={styles.medalName}>???</Text>
              <Text style={styles.medalLevel}>Unlocks at Level {level + 1}</Text>
            </View>
          )}
        </ScrollView>

        <Text style={styles.sectionTitle}>Quick Links:</Text>
        <TouchableOpacity style={styles.homeCard} onPress={() => setActiveTab('play')}>
          <View style={styles.cardIconBox}><Ionicons name="mic" size={28} color="#1DB954" /></View>
          <View style={styles.cardTextBox}><Text style={styles.homeCardTitle}>Play by Chords</Text><Text style={styles.homeCardDesc}>The app listens and finds songs.</Text></View>
        </TouchableOpacity>
        
        {!isPremium && (
          <TouchableOpacity style={styles.premiumUpsellCard} onPress={() => setPaywallVisible(true)}>
            <Ionicons name="star" size={24} color="#000" style={{marginRight: 10}} />
            <Text style={styles.premiumUpsellText}>Unlock Premium - Remove ads</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderWheelScreen = () => (
    <View style={styles.screenContainerCentered}>
      <Text style={styles.screenTitle}>Daily Challenge</Text>
      <View style={styles.wheelSection}>
        <Animated.View style={[styles.wheel, { transform: [{ rotate: spinAnimation }] }]}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1605020420620-20c943cc4669?q=80&w=600&auto=format&fit=crop' }} style={styles.wheelImage} />
        </Animated.View>
        <View style={styles.wheelPointer} />
        <TouchableOpacity style={[styles.spinButton, isSpinning && styles.spinButtonDisabled]} onPress={spinTheWheel} activeOpacity={0.8}>
          <Ionicons name="refresh" size={20} color="#000" style={{marginRight: 8}} />
          <Text style={styles.spinButtonText}>{isSpinning ? 'SPINNING...' : 'SPIN THE WHEEL'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.simulatedText}>The wheel only picks from unlocked songs.</Text>
    </View>
  );

  const renderPlayScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Live Search</Text>
      <View style={styles.micStatusContainer}>
        <Ionicons name="radio" size={20} color="#FF4136" style={{marginRight: 8}} />
        <Text style={styles.statusText}>Hearing right now: <Text style={styles.highlight}>{detectedChord}</Text></Text>
      </View>
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Filter manually:</Text>
        <FlatList horizontal showsHorizontalScrollIndicator={false} data={AVAILABLE_CHORDS} keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.chordChip, detectedChord === item && styles.chordChipActive]} onPress={() => handleChordFilter(item)}>
              <Text style={[styles.chordChipText, detectedChord === item && styles.chordChipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <FlatList data={filteredSongs} keyExtractor={(item) => item.id} renderItem={renderSongItem} contentContainerStyle={styles.listContainer} ListEmptyComponent={<Text style={styles.emptyText}>No songs found.</Text>} />
    </View>
  );

  const renderLibraryScreen = () => (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>All Songs ({songDb.length})</Text>
      <FlatList data={songDb} keyExtractor={(item) => item.id} renderItem={renderSongItem} contentContainerStyle={styles.listContainer} initialNumToRender={8} maxToRenderPerBatch={8} windowSize={5} removeClippedSubviews={true} />
    </View>
  );

  const renderSongItem = ({ item }) => {
    const isLocked = item.reqLevel > level;
    const isCompleted = completedSongs.includes(item.id);

    return (
      <TouchableOpacity style={[styles.songCard, isLocked && styles.songCardLocked]} onPress={() => openSongLesson(item)} activeOpacity={0.7}>
        <CoverImage artist={item.artist} title={item.title} style={[styles.albumArt, isLocked && {opacity: 0.3}]} />
        <View style={styles.songInfo}>
          <View style={styles.titleRow}>
            <Text style={[styles.songTitle, isLocked && {color: '#888'}]} numberOfLines={1}>{item.title}</Text>
            {!isLocked && item.capo > 0 && (<View style={styles.capoBadgeSmall}><Text style={styles.capoBadgeTextSmall}>Capo {item.capo}</Text></View>)}
            {!isLocked && isCompleted && <Ionicons name="checkmark-circle" size={16} color="#1DB954" style={{marginLeft: 6}} />}
          </View>
          <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
          <View style={styles.chordBadgeContainer}>
            {!isLocked ? item.chords.map(c => (<View key={c} style={styles.chordBadge}><Text style={styles.chordBadgeText}>{c}</Text></View>))
                       : <Text style={styles.lockedTextSmall}>Requires Level {item.reqLevel}</Text>}
          </View>
        </View>
        <Ionicons name={isLocked ? "lock-closed" : "chevron-forward"} size={20} color={isLocked ? "#FF4136" : "#555"} style={{alignSelf: 'center'}} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CHORDSPIN</Text>
        {isPremium && <Ionicons name="star" size={20} color="#E2B13C" style={{position: 'absolute', right: 20, top: 15}} />}
      </View>
      
      <View style={styles.mainContent}>
        {activeTab === 'home' && renderHomeScreen()}
        {activeTab === 'wheel' && renderWheelScreen()}
        {activeTab === 'play' && renderPlayScreen()}
        {activeTab === 'library' && renderLibraryScreen()}
      </View>

      {!isPremium && <View style={styles.adBanner}><Text style={styles.adTag}>SPONSORED</Text><Text style={styles.adText}>Get 20% off new guitar strings!</Text></View>}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}><Ionicons name="home" size={24} color={activeTab === 'home' ? '#1DB954' : '#B3B3B3'} /><Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('play')}><Ionicons name="musical-notes" size={24} color={activeTab === 'play' ? '#1DB954' : '#B3B3B3'} /><Text style={[styles.navText, activeTab === 'play' && styles.navTextActive]}>Play</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('wheel')}><Ionicons name="aperture" size={24} color={activeTab === 'wheel' ? '#1DB954' : '#B3B3B3'} /><Text style={[styles.navText, activeTab === 'wheel' && styles.navTextActive]}>Wheel</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('library')}><Ionicons name="library" size={24} color={activeTab === 'library' ? '#1DB954' : '#B3B3B3'} /><Text style={[styles.navText, activeTab === 'library' && styles.navTextActive]}>Songs</Text></TouchableOpacity>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true} onRequestClose={closeSongLesson}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSong && (
              <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={{ paddingBottom: 80 }}>
                <CoverImage artist={selectedSong.artist} title={selectedSong.title} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedSong.title}</Text>
                <Text style={styles.modalArtist}>by {selectedSong.artist}</Text>
                
                <View style={styles.livePlaySection}>
                  <TouchableOpacity style={[styles.playMusicButton, !isPremium && styles.playMusicButtonLocked]} onPress={() => playSound(selectedSong.audioTrack)}>
                    <Ionicons name={isPremium ? (isPlaying ? "pause" : "play") : "lock-closed"} size={22} color={isPremium ? "#000" : "#FFF"} style={{marginRight: 8}} />
                    <Text style={[styles.playMusicButtonText, !isPremium && {color: '#FFF'}]}>{isPremium ? (isPlaying ? 'PAUSE' : 'PLAY AND PRACTICE') : 'UNLOCK AUDIO & FEEDBACK'}</Text>
                  </TouchableOpacity>
                  {isPremium && isPlaying && (
                    <View style={styles.feedbackBox}>
                      <Text style={styles.feedbackLabel}>Your playing right now:</Text>
                      <Text style={[styles.feedbackResult, chordFeedback === 'CORRECT CHORD!' ? styles.textGreen : (chordFeedback === 'WRONG CHORD' ? styles.textRed : styles.textGray)]}>{chordFeedback}</Text>
                    </View>
                  )}
                  {!isPremium && <Text style={styles.premiumHint}>Requires Premium</Text>}
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.bpmBox}><Ionicons name="speedometer-outline" size={16} color="#A0A0A0" style={{marginBottom: 4}} /><Text style={styles.bpmValue}>{selectedSong.bpm} BPM</Text></View>
                  {selectedSong.capo > 0 ? (
                    <View style={styles.capoAlertBox}><Ionicons name="warning-outline" size={20} color="#000" style={{marginRight: 6}} /><Text style={styles.capoAlertText}>Capo fret {selectedSong.capo}</Text></View>
                  ) : (
                    <View style={[styles.capoAlertBox, styles.noCapoBox]}><Ionicons name="checkmark-circle-outline" size={20} color="#A0A0A0" style={{marginRight: 6}} /><Text style={styles.noCapoText}>No Capo</Text></View>
                  )}
                </View>

                <View style={styles.lessonSection}><Text style={styles.lessonLabel}>Chords to know:</Text><View style={styles.chordBadgeContainer}>{selectedSong.chords.map(c => (<View key={c} style={styles.chordBadgeLg}><Text style={styles.chordBadgeLgText}>{c}</Text></View>))}</View></View>
                <View style={styles.lessonSection}><Text style={styles.lessonLabel}>Strumming:</Text><View style={styles.strumBox}><Text style={styles.strumText}>{selectedSong.strumming}</Text></View><Text style={styles.instructionText}>{selectedSong.instructions}</Text></View>
                <View style={styles.lessonSection}><Text style={styles.lessonLabel}>Lyrics & Chords:</Text><View style={styles.lyricsBox}>{renderLyricsWithChords(selectedSong.lyricsWithChords)}</View></View>

                <TouchableOpacity style={styles.youtubeButton} onPress={() => openYouTube(selectedSong)}>
                  <Ionicons name="logo-youtube" size={20} color="#FFF" style={{marginRight: 8}} />
                  <Text style={styles.youtubeButtonText}>Watch Video Lesson</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.completeLessonButton, completedSongs.includes(selectedSong.id) && {backgroundColor: '#444'}]} 
                  onPress={completeLesson}
                  disabled={completedSongs.includes(selectedSong.id)}
                >
                  <Ionicons name={completedSongs.includes(selectedSong.id) ? "checkmark-circle" : "star"} size={20} color={completedSongs.includes(selectedSong.id) ? "#1DB954" : "#000"} style={{marginRight: 8}} />
                  <Text style={[styles.completeLessonButtonText, completedSongs.includes(selectedSong.id) && {color: '#FFF'}]}>
                    {completedSongs.includes(selectedSong.id) ? 'Already played (0 XP)' : 'Done! (+20 XP)'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.closeButton} onPress={closeSongLesson}><Text style={styles.closeButtonText}>Close window</Text></TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={levelUpModalVisible} animationType="fade" transparent={true}>
        <View style={styles.paywallOverlay}>
          <View style={[styles.paywallContent, {alignItems: 'center', borderColor: '#E2B13C', borderWidth: 2}]}>
            <Ionicons name={MEDALS[level] ? MEDALS[level].icon : "trophy"} size={80} color={MEDALS[level] ? MEDALS[level].color : "#1DB954"} style={{marginBottom: 10}} />
            <Text style={{color: '#1DB954', fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 5}}>LEVEL UP!</Text>
            <Text style={{color: '#FFF', fontSize: 18, marginBottom: 20, textAlign: 'center'}}>You reached Level {level}</Text>
            
            <View style={{backgroundColor: '#282828', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 25}}>
              <Text style={{color: '#A0A0A0', fontSize: 12, marginBottom: 5}}>NEW MEDAL UNLOCKED:</Text>
              <Text style={{color: MEDALS[level] ? MEDALS[level].color : '#FFF', fontSize: 20, fontWeight: 'bold'}}>{MEDALS[level] ? MEDALS[level].name : `Master`}</Text>
              <Text style={{color: '#FFF', fontSize: 14, marginTop: 5, textAlign: 'center'}}>{MEDALS[level] ? MEDALS[level].desc : ''}</Text>
            </View>

            <Text style={{color: '#E2B13C', fontSize: 16, fontWeight: 'bold', marginBottom: 20, textAlign: 'center'}}>New harder songs are now in your library!</Text>
            <TouchableOpacity style={[styles.subscribeButton, {width: '100%'}]} onPress={() => setLevelUpModalVisible(false)}><Text style={styles.subscribeButtonText}>Awesome!</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={paywallVisible} animationType="slide" transparent={true}>
        <View style={styles.paywallOverlay}>
          <View style={styles.paywallContent}>
            <Ionicons name="star" size={50} color="#E2B13C" style={{alignSelf: 'center', marginBottom: 10}} />
            <Text style={styles.paywallTitle}>ChordSpin Premium</Text>
            <Text style={styles.paywallSubtitle}>Take your playing to the next level!</Text>
            
            <View style={styles.featureList}>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#1DB954" style={{marginRight: 10}} /><Text style={styles.featureText}>Unlock Level 5 and beyond</Text></View>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#1DB954" style={{marginRight: 10}} /><Text style={styles.featureText}>Listen to the songs in the app</Text></View>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#1DB954" style={{marginRight: 10}} /><Text style={styles.featureText}>Live feedback on your chords</Text></View>
              <View style={styles.featureItem}><Ionicons name="checkmark-circle" size={20} color="#1DB954" style={{marginRight: 10}} /><Text style={styles.featureText}>Completely ad-free experience</Text></View>
            </View>

            <TouchableOpacity style={styles.subOption} onPress={() => { setIsPremium(true); setPaywallVisible(false); }}>
              <Text style={styles.subOptionTitle}>1 Month</Text>
              <Text style={styles.subOptionPrice}>$5.99</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subOption} onPress={() => { setIsPremium(true); setPaywallVisible(false); }}>
              <Text style={styles.subOptionTitle}>3 Months</Text>
              <Text style={styles.subOptionPrice}>$14.99</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subOptionHighlight} onPress={() => { setIsPremium(true); setPaywallVisible(false); }}>
              <Text style={styles.subOptionTitleHighlight}>1 Year (Best value)</Text>
              <Text style={styles.subOptionPriceHighlight}>$49.99</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={() => setPaywallVisible(false)}>
              <Text style={styles.cancelButtonText}>No thanks, I'll play with ads</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#282828', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', paddingTop: 40 },
  headerTitle: { color: '#E2B13C', fontSize: 20, fontWeight: '900', letterSpacing: 4 },
  mainContent: { flex: 1 },
  screenContainer: { flex: 1, padding: 20 },
  screenContainerCentered: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  welcomeText: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  screenTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 10 },
  
  xpContainer: { backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, marginBottom: 20, borderWidth: 1, borderColor: '#333' },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  levelTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  xpText: { color: '#A0A0A0', fontSize: 14 },
  xpBarBackground: { height: 12, backgroundColor: '#282828', borderRadius: 6, overflow: 'hidden' },
  xpBarFill: { height: '100%', backgroundColor: '#1DB954' },
  premiumHintSmall: { color: '#A0A0A0', fontSize: 12, marginTop: 8, fontStyle: 'italic', textAlign: 'center' },
  
  medalScroll: { marginBottom: 20 },
  medalCard: { backgroundColor: '#1E1E1E', padding: 15, borderRadius: 12, alignItems: 'center', marginRight: 15, minWidth: 120, borderWidth: 1, borderColor: '#333' },
  medalName: { color: '#FFF', fontSize: 14, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
  medalLevel: { color: '#A0A0A0', fontSize: 10, marginTop: 4 },

  homeCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center' },
  cardIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#282828', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  cardTextBox: { flex: 1 },
  homeCardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  homeCardDesc: { color: '#A0A0A0', fontSize: 13, lineHeight: 18 },
  premiumUpsellCard: { flexDirection: 'row', backgroundColor: '#E2B13C', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 5 },
  premiumUpsellText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  adBanner: { backgroundColor: '#282828', padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#333' },
  adTag: { color: '#888', fontSize: 10, fontWeight: 'bold', marginBottom: 2 },
  adText: { color: '#1DB954', fontSize: 12, fontWeight: '600' },

  bottomNav: { flexDirection: 'row', backgroundColor: '#181818', paddingVertical: 10, paddingBottom: 25, borderTopWidth: 1, borderTopColor: '#282828', justifyContent: 'space-around' },
  navItem: { alignItems: 'center', flex: 1 },
  navText: { color: '#B3B3B3', fontSize: 11, fontWeight: '600', marginTop: 4 },
  navTextActive: { color: '#1DB954' },
  
  listContainer: { paddingBottom: 40 },
  songCard: { flexDirection: 'row', backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, marginBottom: 12 },
  songCardLocked: { backgroundColor: '#151515', borderColor: '#222', borderWidth: 1 },
  albumArt: { width: 60, height: 60, borderRadius: 8, marginRight: 15, backgroundColor: '#282828' },
  songInfo: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 2 },
  songTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginRight: 8, flexShrink: 1 },
  songArtist: { color: '#B3B3B3', fontSize: 13, marginBottom: 6 },
  capoBadgeSmall: { backgroundColor: '#E2B13C', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  capoBadgeTextSmall: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  chordBadgeContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chordBadge: { backgroundColor: '#282828', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6, marginBottom: 4 },
  chordBadgeText: { color: '#1DB954', fontSize: 10, fontWeight: '700' },
  lockedTextSmall: { color: '#FF4136', fontSize: 10, fontWeight: 'bold', fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1E1E', height: '92%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalImage: { width: 120, height: 120, borderRadius: 10, alignSelf: 'center', marginBottom: 15, backgroundColor: '#282828' },
  modalTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  modalArtist: { color: '#B3B3B3', fontSize: 16, textAlign: 'center', marginBottom: 20 },

  livePlaySection: { backgroundColor: '#282828', padding: 15, borderRadius: 15, marginBottom: 20 },
  playMusicButton: { flexDirection: 'row', backgroundColor: '#1DB954', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  playMusicButtonLocked: { backgroundColor: '#444' },
  playMusicButtonText: { color: '#000', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  premiumHint: { color: '#A0A0A0', fontSize: 12, textAlign: 'center', marginTop: 10, fontStyle: 'italic' },
  
  feedbackBox: { marginTop: 15, alignItems: 'center', padding: 10, backgroundColor: '#181818', borderRadius: 10 },
  feedbackLabel: { color: '#A0A0A0', fontSize: 12, marginBottom: 5 },
  feedbackResult: { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  textGreen: { color: '#1DB954' }, textRed: { color: '#FF4136' }, textGray: { color: '#B3B3B3' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  bpmBox: { backgroundColor: '#282828', padding: 10, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 10 },
  bpmValue: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  capoAlertBox: { flexDirection: 'row', backgroundColor: '#E2B13C', padding: 10, borderRadius: 8, alignItems: 'center', flex: 1.5, justifyContent: 'center' },
  capoAlertText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  noCapoBox: { backgroundColor: '#282828' },
  noCapoText: { color: '#A0A0A0', fontSize: 14, fontWeight: 'bold' },

  lessonSection: { marginBottom: 25 },
  lessonLabel: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  chordBadgeLg: { backgroundColor: '#282828', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10, marginRight: 10, marginBottom: 5 },
  chordBadgeLgText: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
  strumBox: { backgroundColor: '#282828', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  strumText: { color: '#E2B13C', fontSize: 22, fontWeight: 'bold', letterSpacing: 4 },
  instructionText: { color: '#A0A0A0', fontSize: 14, lineHeight: 22 },
  lyricsBox: { backgroundColor: '#181818', padding: 15, borderRadius: 10 },
  lyricLine: { marginBottom: 4, flexWrap: 'wrap', flexDirection: 'row' },
  lyricChord: { color: '#1DB954', fontWeight: 'bold', fontSize: 15 },
  lyricText: { color: '#E0E0E0', fontSize: 15, lineHeight: 24 },
  
  youtubeButton: { flexDirection: 'row', backgroundColor: '#FF0000', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  youtubeButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

  completeLessonButton: { flexDirection: 'row', backgroundColor: '#E2B13C', padding: 15, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginTop: 15 },
  completeLessonButtonText: { color: '#000', fontSize: 16, fontWeight: 'bold' },

  closeButton: { padding: 15, alignItems: 'center', marginTop: 10 },
  closeButtonText: { color: '#B3B3B3', fontSize: 14, fontWeight: 'bold' },

  paywallOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  paywallContent: { backgroundColor: '#1E1E1E', width: '90%', borderRadius: 20, padding: 30 },
  paywallTitle: { color: '#FFF', fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
  paywallSubtitle: { color: '#A0A0A0', fontSize: 14, textAlign: 'center', marginBottom: 25 },
  featureList: { marginBottom: 25 },
  featureItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  featureText: { color: '#E0E0E0', fontSize: 14 },
  
  subOption: { backgroundColor: '#282828', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  subOptionTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  subOptionPrice: { color: '#1DB954', fontSize: 16, fontWeight: 'bold' },
  
  subOptionHighlight: { backgroundColor: '#1DB954', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, elevation: 5 },
  subOptionTitleHighlight: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  subOptionPriceHighlight: { color: '#000', fontSize: 16, fontWeight: 'bold' },
  
  subscribeButton: { backgroundColor: '#1DB954', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 15 },
  subscribeButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  cancelButton: { padding: 10, alignItems: 'center' },
  cancelButtonText: { color: '#A0A0A0', fontSize: 12, textDecorationLine: 'underline' },

  wheelSection: { alignItems: 'center', marginVertical: 20, position: 'relative' },
  wheel: { width: width * 0.7, height: width * 0.7, borderRadius: width * 0.35, borderWidth: 4, borderColor: '#282828', overflow: 'hidden' },
  wheelImage: { width: '100%', height: '100%', opacity: 0.9 },
  wheelPointer: { position: 'absolute', top: -10, width: 0, height: 0, borderStyle: 'solid', borderLeftWidth: 15, borderRightWidth: 15, borderBottomWidth: 25, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#1DB954', transform: [{ rotate: '180deg' }], zIndex: 10 },
  spinButton: { flexDirection: 'row', position: 'absolute', bottom: -20, backgroundColor: '#E2B13C', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 30, elevation: 8, alignItems: 'center' },
  spinButtonDisabled: { backgroundColor: '#555' },
  spinButtonText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
  micStatusContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  statusText: { color: '#A0A0A0', fontSize: 16 },
  highlight: { color: '#1DB954', fontWeight: 'bold' },
  filterSection: { marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 14, marginBottom: 10 },
  chordChip: { backgroundColor: '#282828', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginRight: 10 },
  chordChipActive: { backgroundColor: '#1DB954' },
  chordChipText: { color: '#B3B3B3', fontWeight: '600' },
  chordChipTextActive: { color: '#000' }
});
