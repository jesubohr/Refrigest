import { StyleSheet, Font } from '@react-pdf/renderer'

// Register font if needed (Helvetica is built in)

export const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 40,
    backgroundColor: '#ffffff',
    color: '#111111',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  logo: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  subtitle: {
    fontSize: 8,
    color: '#888888',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 120,
    color: '#666666',
    fontSize: 9,
  },
  value: {
    flex: 1,
    fontSize: 9,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e5e5',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: '#aaaaaa',
  },
  divider: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    marginVertical: 12,
  },
  warningBox: {
    backgroundColor: '#fff8e1',
    borderRadius: 4,
    padding: 10,
    marginTop: 8,
    fontSize: 8,
    color: '#6d4c00',
  },
})
