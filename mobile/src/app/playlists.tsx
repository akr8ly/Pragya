import { Link } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
export default function PlaylistsScreen() {
  return <ScrollView style={s.page} contentContainerStyle={s.body}>
    <Link href="/" style={s.back}>←  Home</Link><Text style={s.title}>Playlists</Text><Text style={s.sub}>A soundtrack for the moment</Text>
    <View style={s.hero}><Text style={s.tag}>EXAMPLE PLAYLIST PREVIEW</Text><Text style={s.name}>Soft Focus</Text><Text style={s.copy}>Gentle tracks for a quieter mind.</Text><Text style={s.button}>Spotify connection is not available in this prototype yet</Text></View>
    <Text style={s.head}>What do you need right now?</Text><View style={s.chips}><Text style={s.chip}>Calm</Text><Text style={s.chip}>Focus</Text><Text style={s.chip}>Comfort</Text><Text style={s.chip}>Energy</Text></View>
    <Text style={s.head}>Example recommendations</Text><View style={s.row}><Text style={s.rowTitle}>A softer evening</Text><Text style={s.muted}>Calm · Open in Spotify</Text></View>
  </ScrollView>;
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:"#F8F7F1"},body:{padding:24,paddingTop:28,gap:16},back:{color:"#214B3B",fontSize:15,fontWeight:"600"},title:{color:"#173D32",fontSize:32,fontWeight:"700",marginTop:10},sub:{color:"#68746F",fontSize:16},hero:{backgroundColor:"#173D32",borderRadius:24,padding:22,minHeight:250,justifyContent:"flex-end",gap:10},tag:{color:"#D5E1D1",fontSize:10,letterSpacing:1.5,fontWeight:"700"},name:{color:"white",fontSize:34,fontWeight:"700"},copy:{color:"#F1F0E8",fontSize:15},button:{color:"white",backgroundColor:"#168A4B",padding:13,borderRadius:24,overflow:"hidden",textAlign:"center",fontWeight:"700",marginTop:8},head:{color:"#173D32",fontSize:20,fontWeight:"700",marginTop:6},chips:{flexDirection:"row",flexWrap:"wrap",gap:8},chip:{color:"#214B3B",backgroundColor:"#EEF1E8",padding:11,borderRadius:18,overflow:"hidden"},row:{backgroundColor:"white",padding:16,borderRadius:18,borderColor:"#ECEAE1",borderWidth:1},rowTitle:{color:"#173D32",fontSize:18,fontWeight:"700"},muted:{color:"#68746F",marginTop:5}});
