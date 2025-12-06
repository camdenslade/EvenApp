// src/components/MatchModal.tsx

// React Native ---------------------------------------------------------
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

// ====================================================================
// # PROPS
// ====================================================================

interface Props {
  /** Whether the modal is visible */
  visible: boolean;

  /** Current user's profile photo */
  mePhoto: string | null;

  /** Matched user's profile photo */
  themPhoto: string | null;

  /** Close modal — returns to swiping */
  onClose: () => void;

  /** Navigate to messaging screen */
  onMessage: () => void;
}

// ====================================================================
// # MATCH MODAL COMPONENT
// ====================================================================
//
// Displays a celebration modal when a mutual "like" creates a match.
// Includes:
//
//   - Title ("It's a Match!")
//   - User photos side-by-side
//   - Primary action → Send Message
//   - Secondary action → Keep Swiping
//
// Modal fades in/out and overlays the entire screen.
//

export function MatchModal({
  visible,
  mePhoto,
  themPhoto,
  onClose,
  onMessage,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>

          <Text style={styles.title}>It's a Match!</Text>

          {/* Photos Row ------------------------------------------------ */}
          <View style={styles.row}>
            <Image
              source={{ uri: mePhoto || undefined }}
              style={styles.photo}
            />
            <Image
              source={{ uri: themPhoto || undefined }}
              style={styles.photo}
            />
          </View>

          {/* Primary Action: Send Message ----------------------------- */}
          <TouchableOpacity onPress={onMessage} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Send a Message</Text>
          </TouchableOpacity>

          {/* Secondary Action: Close Modal ----------------------------- */}
          <TouchableOpacity onPress={onClose} style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Keep Swiping</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

// ====================================================================
// # STYLES
// ====================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '82%',
    backgroundColor: '#181818',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 22,
  },

  row: {
    flexDirection: 'row',
    marginBottom: 28,
  },

  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginHorizontal: 12,
    backgroundColor: '#333',
  },

  btnPrimary: {
    width: '100%',
    backgroundColor: '#8b3dff',
    paddingVertical: 14,
    borderRadius: 10,
    marginBottom: 12,
  },

  btnPrimaryText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },

  btnSecondary: {
    width: '100%',
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 10,
  },

  btnSecondaryText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 16,
  },
});
